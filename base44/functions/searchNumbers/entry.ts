import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json().catch(() => ({}));
    const {
      country_code = 'US',
      area_code = '',
      contains = '',
      number_type = 'local',
      page_size = 30,
      in_region = '',
      in_postal_code = '',
    } = body;

    // Vanity phrase -> Twilio Contains pattern
    // Twilio accepts letters, digits, and wildcards (* or .)
    // Letters are auto-mapped to keypad digits by Twilio
    let containsPattern = (contains || '').trim();
    if (containsPattern) {
      // Remove spaces but keep letters, digits, and wildcards
      containsPattern = containsPattern.replace(/\s+/g, '').toUpperCase();
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');

    if (!accountSid || !authToken) {
      return Response.json({ error: 'Phone number search is not configured. Missing Twilio credentials.' }, { status: 503 });
    }

    // Map number_type to Twilio endpoint segment
    const typeMap = {
      local: 'Local',
      toll_free: 'TollFree',
      tollfree: 'TollFree',
      mobile: 'Mobile',
      national: 'Local',
    };
    const twilioType = typeMap[number_type?.toLowerCase()] || 'Local';

    // Build query params
    const params = new URLSearchParams();
    params.set('PageSize', String(Math.min(page_size, 100)));
    if (area_code && twilioType === 'Local') params.set('AreaCode', area_code);
    if (containsPattern) params.set('Contains', containsPattern);
    if (in_region) params.set('InRegion', in_region);
    if (in_postal_code) params.set('InPostalCode', in_postal_code);

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/AvailablePhoneNumbers/${country_code.toUpperCase()}/${twilioType}.json?${params.toString()}`;

    console.log('[searchNumbers] Calling Twilio:', url);

    const authHeader = 'Basic ' + btoa(`${accountSid}:${authToken}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[searchNumbers] Twilio error:', data);
      return Response.json({
        error: data?.message || 'Failed to search phone numbers',
        code: data?.code,
      }, { status: response.status });
    }

    const numbers = (data.available_phone_numbers || []).map((n) => ({
      phone_number: n.phone_number,
      friendly_name: n.friendly_name,
      locality: n.locality || n.rate_center || '',
      region: n.region || '',
      postal_code: n.postal_code || '',
      iso_country: n.iso_country || country_code,
      capabilities: {
        voice: n.capabilities?.voice || false,
        sms: n.capabilities?.sms || false,
        mms: n.capabilities?.mms || false,
        fax: n.capabilities?.fax || false,
      },
      beta: n.beta || false,
      address_requirements: n.address_requirements || 'none',
    }));

    return Response.json({
      numbers,
      count: numbers.length,
      query: { country_code, area_code, contains: containsPattern, number_type, in_region, in_postal_code },
    });
  } catch (error) {
    console.error('[searchNumbers] Error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
});