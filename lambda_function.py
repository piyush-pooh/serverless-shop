import json
import boto3
from decimal import Decimal
import uuid
from datetime import datetime

# DynamoDB tables
dynamodb = boto3.resource('dynamodb')
products_table = dynamodb.Table('Products')
orders_table   = dynamodb.Table('Order')

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def lambda_handler(event, context):
    try:
        http_method = event['requestContext']['http']['method'].upper()
        path = event.get('rawPath', '').lower().rstrip('/')

        # Remove stage prefix if present (e.g., /prod)
        if path.startswith('/prod'):
            path = path[5:]

        # ===== GET /products =====
        if http_method == 'GET' and path == '/products':
            response = products_table.scan()
            products = response.get('Items', [])
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps(products, default=decimal_default)
            }

        # ===== POST /order =====
        elif http_method == 'POST' and path == '/order':
            data = json.loads(event['body'])
            product_id = data.get('product_id')
            quantity_ordered = int(data.get('quantity', 0))

            if not product_id or quantity_ordered <= 0:
                return {
                    'statusCode': 400,
                    'body': json.dumps({'error': 'Invalid product_id or quantity'})
                }

            # Check if product exists and get current stock
            product = products_table.get_item(Key={'product_id': product_id}).get('Item')
            if not product:
                return {
                    'statusCode': 404,
                    'body': json.dumps({'error': 'Product not found'})
                }

            if product.get('quantity', 0) < quantity_ordered:
                return {
                    'statusCode': 409,
                    'body': json.dumps({'error': 'Insufficient stock'})
                }

            # Decrement stock atomically
            products_table.update_item(
                Key={'product_id': product_id},
                UpdateExpression='SET quantity = quantity - :q',
                ExpressionAttributeValues={':q': quantity_ordered},
                ConditionExpression='quantity >= :q'
            )

            # Create order entry
            order_id = str(uuid.uuid4())
            orders_table.put_item(Item={
                'order_id': order_id,
                'product_id': product_id,
                'quantity': quantity_ordered,
                'created_at': str(datetime.utcnow())
            })

            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'message': 'Order created',
                    'order_id': order_id,
                    'product_id': product_id,
                    'quantity': quantity_ordered
                })
            }

        # ===== GET /hello =====
        elif http_method == 'GET' and path == '/hello':
            return {
                'statusCode': 200,
                'body': json.dumps({'message': 'Hello from Lambda!'})
            }

        # ===== Route not found =====
        else:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'Route not found'})
            }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
