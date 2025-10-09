import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import type { Visitor } from '@/types/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Visitor ID is required' });
    }

    // Fetch visitor from database
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Visitor not found', verified: false });
    }

    const visitor = data as Visitor;

    // Check if access is granted
    const isVerified = visitor.status !== 'revoked';

    return res.status(200).json({
      verified: isVerified,
      visitor: {
        id: visitor.id,
        name: visitor.name,
        event_name: visitor.event_name,
        date_of_visit: visitor.date_of_visit,
        status: visitor.status,
      },
    });
  } catch (error) {
    console.error('Error verifying visitor:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
