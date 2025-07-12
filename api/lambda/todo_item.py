import json
import boto3
import os
from decimal import Decimal  # Added import for Decimal handling

dynamodb = boto3.resource('dynamodb')
table_name = os.environ['TABLE_NAME']
table = dynamodb.Table(table_name)
allowed_origins = os.environ.get('ALLOWED_ORIGINS', '').split(',')

# Added custom JSON encoder to handle Decimal types from DynamoDB
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
    
    timestamp = int(event['pathParameters']['id'])  # id is timestamp as string, convert to int
    
    method = event['httpMethod']
    
    if method == 'GET':
        # GET /todos/{id}
        response = table.get_item(
            Key={'userSub': user_sub, 'timestamp': timestamp}
        )
        item = response.get('Item')
        if not item:
            return {'statusCode': 404, 'body': json.dumps({'error': 'Item not found'}), 'headers': headers}
        # Use custom encoder to serialize Decimal types
        return {
            'statusCode': 200,
            'body': json.dumps(item, cls=DecimalEncoder),
            'headers': headers
        }
    
    elif method == 'PUT':
        # PUT /todos/{id}: Update text and/or completed
        body = json.loads(event['body'])
        update_expr = 'SET '
        expr_attr_values = {}
        expr_attr_names = {}  # Added for reserved keywords
        if 'text' in body:
            update_expr += '#txt = :text, '
            expr_attr_values[':text'] = body['text']
            expr_attr_names['#txt'] = 'text'  # Alias 'text' as it's reserved
        if 'completed' in body:
            update_expr += 'completed = :completed, '
            expr_attr_values[':completed'] = body['completed']
        if not expr_attr_values:
            return {'statusCode': 400, 'body': json.dumps({'error': 'No updates provided'}), 'headers': headers}
        
        update_expr = update_expr.rstrip(', ')
        
        table.update_item(
            Key={'userSub': user_sub, 'timestamp': timestamp},
            UpdateExpression=update_expr,
            ExpressionAttributeValues=expr_attr_values,
            ExpressionAttributeNames=expr_attr_names if expr_attr_names else None,  
            ReturnValues='ALL_NEW'
        )
        return {'statusCode': 200, 'body': json.dumps({'message': 'Updated'}), 'headers': headers}
    
    elif method == 'DELETE':
        # DELETE /todos/{id}
        table.delete_item(
            Key={'userSub': user_sub, 'timestamp': timestamp}
        )
        return {'statusCode': 204, 'body': json.dumps({'message': 'Deleted'}), 'headers': headers}
    
    return {'statusCode': 405, 'body': json.dumps({'error': 'Method not allowed'}), 'headers': headers}