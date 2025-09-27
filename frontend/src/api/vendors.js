/**
 * Vendor API endpoints
 * Handles HTTP requests for vendor operations
 */

import { createVendor, getVendors, updateVendor, deleteVendor } from '../actions/vendorActions';

/**
 * Handle vendor API requests
 * @param {Request} req - HTTP request
 * @returns {Response} HTTP response
 */
export const handleVendorRequest = async (req) => {
  const { method } = req;
  const url = new URL(req.url);
  const pathSegments = url.pathname.split('/').filter(Boolean);

  try {
    switch (method) {
      case 'GET':
        if (pathSegments.length === 2 && pathSegments[1] === 'vendors') {
          // GET /api/vendors
          const result = await getVendors();
          return new Response(JSON.stringify(result), {
            status: result.success ? 200 : 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        break;

      case 'POST':
        if (pathSegments.length === 2 && pathSegments[1] === 'vendors') {
          // POST /api/vendors
          const body = await req.json();
          const result = await createVendor(body);
          return new Response(JSON.stringify(result), {
            status: result.success ? 201 : 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        break;

      case 'PUT':
        if (pathSegments.length === 3 && pathSegments[1] === 'vendors') {
          // PUT /api/vendors/:id
          const vendorId = pathSegments[2];
          const body = await req.json();
          const result = await updateVendor(vendorId, body);
          return new Response(JSON.stringify(result), {
            status: result.success ? 200 : 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        break;

      case 'DELETE':
        if (pathSegments.length === 3 && pathSegments[1] === 'vendors') {
          // DELETE /api/vendors/:id
          const vendorId = pathSegments[2];
          const result = await deleteVendor(vendorId);
          return new Response(JSON.stringify(result), {
            status: result.success ? 200 : 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        break;

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export default handleVendorRequest;


