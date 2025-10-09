import { APIGatewayProxyHandler } from 'aws-lambda'

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Pets Lambda - Event:', JSON.stringify(event, null, 2))
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: 'Pets endpoint - Coming soon' }),
  }
}
