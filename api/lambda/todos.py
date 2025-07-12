import json
import boto3
import os
import time
from decimal import Decimal  # Added import for Decimal handling

dynamodb = boto3.resource('dynamodb')
table_name = os.environ['TABLE_NAME']
table = dynamodb.Table(table_name)
allowed_origins = os.environ.get('ALLOWED_ORIGINS', '').split(',')

# Custom JSON encoder to handle Decimal types from DynamoDB
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj == obj.to_integral_value() else float(obj)
        return super(DecimalEncoder, self).default(obj)

# Helper to get CORS headers based on request origin
def get_cors_headers(event):
    origin = event['headers'].get('origin', '')
    allow_origin = origin if origin in allowed_origins else '*'
    headers = {
        'Access-Control-Allow-Origin': allow_origin,
        'Access-Control-Allow-Credentials': 'true' if origin in allowed_origins else 'false',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE'
    }
    return headers

def handler(event, context):
    headers = get_cors_headers(event)
    try:
        user_sub = event['requestContext']['authorizer']['claims']['sub']
    except KeyError:
        return {'statusCode': 401, 'body': json.dumps({'error': 'Unauthorized'}), 'headers': headers}
    
    method = event['httpMethod']
    path = event['path']
    
    if path == '/' and method == 'GET':
        # Hello world for root GET
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Hello, authenticated user!'}),
            'headers': headers
        }
    
    if method == 'GET':
        # GET /todos: Retrieve all items for user
        response = table.query(
            KeyConditionExpression='userSub = :sub',
            ExpressionAttributeValues={':sub': user_sub}
        )
        # Use custom encoder to serialize Decimal types
        return {
            'statusCode': 200,
            'body': json.dumps(response['Items'], cls=DecimalEncoder),
            'headers': headers
        }
    
    elif method == 'POST':
        # POST /todos: Add new item
        body = json.loads(event['body'])
        text = body.get('text')
        if not text:
            return {'statusCode': 400, 'body': json.dumps({'error': 'Text required'}), 'headers': headers}
        
        timestamp = int(time.time() * 1000)  # Unix ticks in ms
        item = {
            'userSub': user_sub,
            'timestamp': timestamp,
            'text': text,
            'completed': False
        }
        table.put_item(Item=item)
        return {
            'statusCode': 201,
            'body': json.dumps(item),
            'headers': headers
        }
    
    return {'statusCode': 405, 'body': json.dumps({'error': 'Method not allowed'}), 'headers': headers}