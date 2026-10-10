-- eGame Bénin V2 — Phase B/C: organisateurs et communautés privées
-- Migration additive pour la version officielle, à appliquer après validation des prérequis.
-- Elle n'efface aucune donnée et ne remplace pas les systèmes de paiement existants.
-- N'effectue aucun DROP/reset et ne modifie pas les tables paiements/tickets/tournois.

BEGIN;

CREATE TABLE IF NOT EXISTS public.organizer_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  legal_name text NOT NULL,
  country text NOT NULL,
  professional_contact text NOT NULL,
  status text NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('draft','submitted','under_review','more_info_requested','approved','rejected','suspended')),
  kyc_status text NOT NULL DEFAULT 'disabled_pending_vendor'
    CHECK (kyc_status IN ('disabled_pending_vendor','not_started','pending','verified','rejected')),
  admin_note text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  submitted_at timestamptz,
  terms_accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS organizer_applications_user_idx ON public.organizer_applications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS organizer_applications_status_idx ON public.organizer_applications(status, created_at DESC);

CREATE TABLE IF NOT EXISTS public.organizer_application_communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.organizer_applications(id) ON DELETE CASCADE,
  name text NOT NULL,
  game_key text NOT NULL,
  community_size text,
  public_url text NOT NULL,
  responsibility_proof_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS organizer_application_communities_application_idx ON public.organizer_application_communities(application_id);

CREATE TABLE IF NOT EXISTS public.gaming_communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES public.organizer_applications(id) ON DELETE SET NULL,
  organizer_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  name text NOT NULL,
  game_key text NOT NULL,
  description text,
  logo_url text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','archived')),
  suspended_at timestamptz,
  suspended_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  suspension_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS gaming_communities_owner_idx ON public.gaming_communities(organizer_user_id, status);
CREATE INDEX IF NOT EXISTS gaming_communities_game_idx ON public.gaming_communities(game_key, status);

CREATE TABLE IF NOT EXISTS public.community_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.gaming_communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT community_memberships_profile_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','removed','left')),
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  ended_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(community_id, user_id)
);
CREATE INDEX IF NOT EXISTS community_memberships_user_idx ON public.community_memberships(user_id, status);
CREATE INDEX IF NOT EXISTS community_memberships_community_idx ON public.community_memberships(community_id, status);

CREATE TABLE IF NOT EXISTS public.community_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.gaming_communities(id) ON DELETE CASCADE,
  invited_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_username text NOT NULL,
  invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','withdrawn')),
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS community_invitations_pending_unique
  ON public.community_invitations(community_id, invited_user_id) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS community_invitations_recipient_idx ON public.community_invitations(invited_user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS community_invitations_organizer_idx ON public.community_invitations(invited_by, status, created_at DESC);

CREATE TABLE IF NOT EXISTS public.organizer_decision_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.organizer_applications(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  from_status text,
  to_status text NOT NULL CHECK (to_status IN ('draft','submitted','under_review','more_info_requested','approved','rejected','suspended')),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS organizer_decision_history_app_idx ON public.organizer_decision_history(application_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.organizer_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id uuid REFERENCES public.organizer_applications(id) ON DELETE CASCADE,
  community_id uuid REFERENCES public.gaming_communities(id) ON DELETE CASCADE,
  kind text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS organizer_notifications_user_idx ON public.organizer_notifications(user_id, created_at DESC);

-- Fail closed: no direct REST writes or anon access. Writes use scoped SECURITY DEFINER RPCs.
REVOKE ALL ON public.organizer_applications, public.organizer_application_communities,
  public.gaming_communities, public.community_memberships, public.community_invitations,
  public.organizer_decision_history, public.organizer_notifications FROM anon, authenticated;
GRANT SELECT ON public.organizer_applications, public.organizer_application_communities,
  public.gaming_communities, public.community_memberships, public.community_invitations,
  public.organizer_decision_history, public.organizer_notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizer_applications,
  public.organizer_application_communities, public.gaming_communities,
  public.community_memberships, public.community_invitations,
  public.organizer_decision_history, public.organizer_notifications TO service_role;

ALTER TABLE public.organizer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizer_application_communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gaming_communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizer_decision_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizer_notifications ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER membership/ownership helpers prevent recursive RLS policy evaluation.
CREATE OR REPLACE FUNCTION public.organizer_v2_is_community_member(p_community_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.community_memberships m
    WHERE m.community_id = p_community_id AND m.user_id = auth.uid() AND m.status = 'active'
  );
$function$;
CREATE OR REPLACE FUNCTION public.organizer_v2_owns_community(p_community_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.gaming_communities c
    WHERE c.id = p_community_id AND c.organizer_user_id = auth.uid()
  );
$function$;
CREATE OR REPLACE FUNCTION public.organizer_v2_owns_application(p_application_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.organizer_applications a
    WHERE a.id = p_application_id AND a.user_id = auth.uid()
  );
$function$;
REVOKE ALL ON FUNCTION public.organizer_v2_is_community_member(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.organizer_v2_owns_community(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.organizer_v2_owns_application(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.organizer_v2_is_community_member(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.organizer_v2_owns_community(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.organizer_v2_owns_application(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS organizer_applications_read_scoped ON public.organizer_applications;
CREATE POLICY organizer_applications_read_scoped ON public.organizer_applications
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()) OR public.is_egame_admin());
DROP POLICY IF EXISTS application_communities_read_scoped ON public.organizer_application_communities;
CREATE POLICY application_communities_read_scoped ON public.organizer_application_communities
  FOR SELECT TO authenticated USING (public.is_egame_admin() OR public.organizer_v2_owns_application(application_id));
DROP POLICY IF EXISTS gaming_communities_read_scoped ON public.gaming_communities;
CREATE POLICY gaming_communities_read_scoped ON public.gaming_communities
  FOR SELECT TO authenticated USING (
    public.is_egame_admin() OR organizer_user_id = (SELECT auth.uid()) OR public.organizer_v2_is_community_member(id)
  );
DROP POLICY IF EXISTS community_memberships_read_scoped ON public.community_memberships;
CREATE POLICY community_memberships_read_scoped ON public.community_memberships
  FOR SELECT TO authenticated USING (
    public.is_egame_admin() OR user_id = (SELECT auth.uid()) OR public.organizer_v2_owns_community(community_id)
  );
DROP POLICY IF EXISTS community_invitations_read_scoped ON public.community_invitations;
CREATE POLICY community_invitations_read_scoped ON public.community_invitations
  FOR SELECT TO authenticated USING (
    public.is_egame_admin() OR invited_user_id = (SELECT auth.uid()) OR invited_by = (SELECT auth.uid())
  );
DROP POLICY IF EXISTS organizer_decision_history_read_scoped ON public.organizer_decision_history;
CREATE POLICY organizer_decision_history_read_scoped ON public.organizer_decision_history
  FOR SELECT TO authenticated USING (public.is_egame_admin() OR public.organizer_v2_owns_application(application_id));
DROP POLICY IF EXISTS organizer_notifications_read_own ON public.organizer_notifications;
CREATE POLICY organizer_notifications_read_own ON public.organizer_notifications
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS organizer_notifications_mark_read_own ON public.organizer_notifications;
CREATE POLICY organizer_notifications_mark_read_own ON public.organizer_notifications
  FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));

-- Atomic cap: lock per organizer before counting/creating/updating active communities.
CREATE OR REPLACE FUNCTION public.enforce_organizer_community_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $function$
DECLARE v_count integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended('egame_communities:' || NEW.organizer_user_id::text, 0));
  IF NOT public.is_egame_admin() AND NOT EXISTS (
    SELECT 1 FROM public.organizer_applications a WHERE a.user_id = NEW.organizer_user_id AND a.status = 'approved'
  ) THEN RAISE EXCEPTION 'ORGANIZER_NOT_APPROVED'; END IF;
  SELECT count(*) INTO v_count FROM public.gaming_communities c
  WHERE c.organizer_user_id = NEW.organizer_user_id AND c.status = 'active'
    AND (TG_OP = 'INSERT' OR c.id <> NEW.id);
  IF NEW.status = 'active' AND v_count >= 2 THEN RAISE EXCEPTION 'COMMUNITY_LIMIT_REACHED'; END IF;
  RETURN NEW;
END;
$function$;
REVOKE ALL ON FUNCTION public.enforce_organizer_community_limit() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS gaming_communities_enforce_limit ON public.gaming_communities;
CREATE TRIGGER gaming_communities_enforce_limit BEFORE INSERT OR UPDATE OF organizer_user_id,status
ON public.gaming_communities FOR EACH ROW EXECUTE FUNCTION public.enforce_organizer_community_limit();

CREATE OR REPLACE FUNCTION public.submit_organizer_application(
  p_legal_name text, p_country text, p_professional_contact text, p_communities jsonb,
  p_terms_accepted boolean, p_submit boolean DEFAULT true
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $function$
DECLARE v_app_id uuid; v_community jsonb; v_count integer; v_status text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  IF length(btrim(coalesce(p_legal_name,''))) < 3 THEN RAISE EXCEPTION 'LEGAL_NAME_REQUIRED'; END IF;
  IF length(btrim(coalesce(p_country,''))) < 2 OR length(btrim(p_country)) > 100 THEN RAISE EXCEPTION 'COUNTRY_REQUIRED'; END IF;
  IF length(btrim(coalesce(p_professional_contact,''))) < 5 THEN RAISE EXCEPTION 'CONTACT_REQUIRED'; END IF;
  IF NOT coalesce(p_terms_accepted,false) THEN RAISE EXCEPTION 'TERMS_REQUIRED'; END IF;
  IF jsonb_typeof(p_communities) <> 'array' THEN RAISE EXCEPTION 'COMMUNITIES_REQUIRED'; END IF;
  v_count := jsonb_array_length(p_communities);
  IF v_count < 1 OR v_count > 2 THEN RAISE EXCEPTION 'MAX_TWO_COMMUNITIES'; END IF;
  IF EXISTS (SELECT 1 FROM public.organizer_applications a WHERE a.user_id=auth.uid() AND a.status NOT IN ('rejected')) THEN
    RAISE EXCEPTION 'APPLICATION_ALREADY_EXISTS';
  END IF;
  v_status := CASE WHEN p_submit THEN 'submitted' ELSE 'draft' END;
  INSERT INTO public.organizer_applications(user_id,legal_name,country,professional_contact,terms_accepted_at,status,kyc_status,submitted_at)
  VALUES(auth.uid(),btrim(p_legal_name),upper(btrim(p_country)),btrim(p_professional_contact),now(),v_status,'disabled_pending_vendor',CASE WHEN p_submit THEN now() ELSE NULL END)
  RETURNING id INTO v_app_id;
  FOR v_community IN SELECT value FROM jsonb_array_elements(p_communities) LOOP
    IF nullif(btrim(v_community->>'name'),'') IS NULL OR nullif(btrim(v_community->>'game_key'),'') IS NULL
       OR nullif(btrim(v_community->>'public_url'),'') IS NULL OR nullif(btrim(v_community->>'responsibility_proof_url'),'') IS NULL
    THEN RAISE EXCEPTION 'COMMUNITY_FIELDS_REQUIRED'; END IF;
    INSERT INTO public.organizer_application_communities(application_id,name,game_key,community_size,public_url,responsibility_proof_url)
    VALUES(v_app_id,btrim(v_community->>'name'),btrim(v_community->>'game_key'),nullif(btrim(v_community->>'community_size'),''),btrim(v_community->>'public_url'),btrim(v_community->>'responsibility_proof_url'));
  END LOOP;
  INSERT INTO public.organizer_decision_history(application_id,actor_user_id,to_status,note)
  VALUES(v_app_id,auth.uid(),v_status,CASE WHEN p_submit THEN 'Application submitted' ELSE 'Draft saved' END);
  RETURN v_app_id;
END;
$function$;
REVOKE ALL ON FUNCTION public.submit_organizer_application(text,text,text,jsonb,boolean,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_organizer_application(text,text,text,jsonb,boolean,boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public.review_organizer_application(p_application_id uuid,p_status text,p_note text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $function$
DECLARE v_app public.organizer_applications%ROWTYPE; v_community record;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_egame_admin() THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
  IF p_status NOT IN ('under_review','more_info_requested','approved','rejected','suspended') THEN RAISE EXCEPTION 'INVALID_STATUS'; END IF;
  SELECT * INTO v_app FROM public.organizer_applications WHERE id=p_application_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'APPLICATION_NOT_FOUND'; END IF;
  UPDATE public.organizer_applications SET status=p_status,admin_note=p_note,reviewed_by=auth.uid(),reviewed_at=now(),updated_at=now() WHERE id=p_application_id;
  INSERT INTO public.organizer_decision_history(application_id,actor_user_id,from_status,to_status,note)
  VALUES(p_application_id,auth.uid(),v_app.status,p_status,p_note);
  IF p_status='approved' THEN
    FOR v_community IN SELECT * FROM public.organizer_application_communities WHERE application_id=p_application_id LOOP
      IF NOT EXISTS (SELECT 1 FROM public.gaming_communities c WHERE c.application_id=p_application_id AND c.name=v_community.name AND c.game_key=v_community.game_key) THEN
        INSERT INTO public.gaming_communities(application_id,organizer_user_id,name,game_key,status)
        VALUES(p_application_id,v_app.user_id,v_community.name,v_community.game_key,'active');
      END IF;
    END LOOP;
  ELSIF p_status='suspended' THEN
    UPDATE public.gaming_communities SET status='suspended',suspended_at=now(),suspended_by=auth.uid(),suspension_reason=p_note,updated_at=now()
    WHERE organizer_user_id=v_app.user_id AND status='active';
  END IF;
  INSERT INTO public.organizer_notifications(user_id,application_id,kind,title,body)
  VALUES(v_app.user_id,v_app.id,'application_'||p_status,'Organizer application update',coalesce(p_note,p_status));
  RETURN jsonb_build_object('ok',true,'status',p_status);
END;
$function$;
REVOKE ALL ON FUNCTION public.review_organizer_application(uuid,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_organizer_application(uuid,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.create_gaming_community(p_name text,p_game_key text,p_description text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $function$
DECLARE v_id uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (SELECT 1 FROM public.organizer_applications WHERE user_id=auth.uid() AND status='approved') THEN RAISE EXCEPTION 'ORGANIZER_NOT_APPROVED'; END IF;
  IF length(btrim(coalesce(p_name,''))) < 2 OR nullif(btrim(p_game_key),'') IS NULL THEN RAISE EXCEPTION 'COMMUNITY_DETAILS_REQUIRED'; END IF;
  INSERT INTO public.gaming_communities(organizer_user_id,name,game_key,description,status)
  VALUES(auth.uid(),btrim(p_name),btrim(p_game_key),nullif(btrim(p_description),''),'active') RETURNING id INTO v_id;
  RETURN v_id;
END;
$function$;
REVOKE ALL ON FUNCTION public.create_gaming_community(text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_gaming_community(text,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.invite_community_member(p_community_id uuid,p_username text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $function$
DECLARE v_community public.gaming_communities%ROWTYPE; v_target uuid; v_username text; v_invite uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  SELECT * INTO v_community FROM public.gaming_communities WHERE id=p_community_id AND organizer_user_id=auth.uid() AND status='active';
  IF NOT FOUND THEN RAISE EXCEPTION 'COMMUNITY_NOT_OWNED_OR_INACTIVE'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.organizer_applications WHERE user_id=auth.uid() AND status='approved') THEN RAISE EXCEPTION 'ORGANIZER_NOT_APPROVED'; END IF;
  SELECT id,username INTO v_target,v_username FROM public.profiles WHERE lower(username)=lower(btrim(p_username));
  IF v_target IS NULL THEN RAISE EXCEPTION 'PLAYER_NOT_FOUND'; END IF;
  IF v_target=auth.uid() THEN RAISE EXCEPTION 'CANNOT_INVITE_SELF'; END IF;
  IF EXISTS(SELECT 1 FROM public.community_memberships WHERE community_id=p_community_id AND user_id=v_target AND status='active') THEN RAISE EXCEPTION 'ALREADY_MEMBER'; END IF;
  INSERT INTO public.community_invitations(community_id,invited_user_id,invited_username,invited_by)
  VALUES(p_community_id,v_target,v_username,auth.uid()) RETURNING id INTO v_invite;
  INSERT INTO public.organizer_notifications(user_id,kind,title,body)
  VALUES(v_target,'community_invitation','Community invitation','You have a community invitation.');
  RETURN v_invite;
END;
$function$;
REVOKE ALL ON FUNCTION public.invite_community_member(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.invite_community_member(uuid,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.respond_community_invitation(p_invitation_id uuid,p_accept boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $function$
DECLARE v_inv public.community_invitations%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  SELECT * INTO v_inv FROM public.community_invitations WHERE id=p_invitation_id AND invited_user_id=auth.uid() AND status='pending' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'INVITATION_NOT_FOUND'; END IF;
  UPDATE public.community_invitations SET status=CASE WHEN p_accept THEN 'accepted' ELSE 'declined' END,responded_at=now(),updated_at=now() WHERE id=p_invitation_id;
  IF p_accept THEN
    IF NOT EXISTS (SELECT 1 FROM public.gaming_communities c WHERE c.id=v_inv.community_id AND c.status='active') THEN RAISE EXCEPTION 'COMMUNITY_INACTIVE'; END IF;
    INSERT INTO public.community_memberships(community_id,user_id,invited_by,status)
    VALUES(v_inv.community_id,auth.uid(),v_inv.invited_by,'active')
    ON CONFLICT(community_id,user_id) DO UPDATE SET status='active',joined_at=now(),ended_at=NULL,ended_by=NULL;
  END IF;
  RETURN jsonb_build_object('ok',true,'status',CASE WHEN p_accept THEN 'accepted' ELSE 'declined' END);
END;
$function$;
REVOKE ALL ON FUNCTION public.respond_community_invitation(uuid,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.respond_community_invitation(uuid,boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public.remove_community_member(p_membership_id uuid,p_reason text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $function$
DECLARE v_membership public.community_memberships%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  SELECT m.* INTO v_membership FROM public.community_memberships m JOIN public.gaming_communities c ON c.id=m.community_id
  WHERE m.id=p_membership_id AND m.status='active' AND (c.organizer_user_id=auth.uid() OR public.is_egame_admin()) FOR UPDATE OF m;
  IF NOT FOUND THEN RAISE EXCEPTION 'MEMBERSHIP_NOT_FOUND_OR_FORBIDDEN'; END IF;
  UPDATE public.community_memberships SET status='removed',ended_at=now(),ended_by=auth.uid() WHERE id=p_membership_id;
  RETURN jsonb_build_object('ok',true);
END;
$function$;
REVOKE ALL ON FUNCTION public.remove_community_member(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.remove_community_member(uuid,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.set_organizer_community_status(p_community_id uuid,p_status text,p_reason text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $function$
DECLARE v_community public.gaming_communities%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_egame_admin() THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
  IF p_status NOT IN ('active','suspended','archived') THEN RAISE EXCEPTION 'INVALID_COMMUNITY_STATUS'; END IF;
  SELECT * INTO v_community FROM public.gaming_communities WHERE id=p_community_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'COMMUNITY_NOT_FOUND'; END IF;
  UPDATE public.gaming_communities SET status=p_status,
    suspended_at=CASE WHEN p_status='suspended' THEN now() ELSE NULL END,
    suspended_by=CASE WHEN p_status='suspended' THEN auth.uid() ELSE NULL END,
    suspension_reason=CASE WHEN p_status='suspended' THEN p_reason ELSE NULL END,
    updated_at=now()
  WHERE id=p_community_id;
  RETURN jsonb_build_object('ok',true,'status',p_status);
END;
$function$;
REVOKE ALL ON FUNCTION public.set_organizer_community_status(uuid,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_organizer_community_status(uuid,text,text) TO authenticated;

COMMIT;
