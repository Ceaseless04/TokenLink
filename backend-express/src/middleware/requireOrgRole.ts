import { NextFunction, Request, Response } from 'express';
import { supabaseAdmin } from '../supabaseClient';

type OrgIdSource = { param?: string; body?: string };

export function requireOrgRole(source: OrgIdSource, roles: string[] = ['organizer', 'admin']) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const localUser = (req as any).localUser;
      if (!localUser) return res.status(401).json({ error: 'Not authenticated' });

      let orgId: string | undefined;
      if (source.param) orgId = (req as any).params[source.param];
      if (!orgId && source.body) orgId = (req as any).body[source.body];
      if (!orgId) return res.status(400).json({ error: 'organization id not found in request' });

      const { data: membership, error } = await supabaseAdmin
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', localUser.id)
        .single();

      if (error || !membership) return res.status(403).json({ error: 'User is not a member of this organization' });

      if (!roles.includes(membership.role)) return res.status(403).json({ error: 'Insufficient privileges' });

      next();
    } catch (err) {
      next(err);
    }
  };
}
