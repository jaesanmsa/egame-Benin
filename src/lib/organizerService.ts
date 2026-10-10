import { supabase } from "@/lib/supabase";
import { CommunityInvitation, GamingCommunity, OrganizerApplication, OrganizerDecision, OrganizerStatus, RequestedCommunity } from "@/lib/organizerV2";

export class OrganizerBackendUnavailable extends Error {
  constructor(message = "La migration du portail organisateur n'est pas encore installée sur ce projet Supabase.") {
    super(message);
    this.name = "OrganizerBackendUnavailable";
  }
}

const isMissingBackend = (error: any) =>
  error?.code === "42P01" || error?.code === "PGRST205" || error?.code === "PGRST202" ||
  String(error?.message || "").toLowerCase().includes("organizer_applications") ||
  String(error?.message || "").toLowerCase().includes("gaming_communities") ||
  String(error?.message || "").toLowerCase().includes("community_invitations") ||
  String(error?.message || "").toLowerCase().includes("submit_organizer_application") ||
  String(error?.message || "").toLowerCase().includes("create_gaming_community") ||
  String(error?.message || "").toLowerCase().includes("invite_community_member");

const fail = (error: any): never => {
  if (isMissingBackend(error)) throw new OrganizerBackendUnavailable();
  throw new Error(error?.message || "La requête organisateur a échoué.");
};

const mapApplication = (row: any, communities: any[], decisions: any[], email = ""): OrganizerApplication => ({
  id: row.id,
  userId: row.user_id,
  email,
  applicantName: row.legal_name,
  country: row.country,
  professionalContact: row.professional_contact,
  communities: communities.map((item) => ({ id: item.id, name: item.name, game: item.game_key, size: item.community_size || "", publicUrl: item.public_url, responsibilityProofUrl: item.responsibility_proof_url })),
  termsAccepted: !!row.terms_accepted_at,
  status: row.status,
  adminNote: row.admin_note || "",
  kycStatus: row.kyc_status || "disabled_pending_vendor",
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  decisions: decisions.map((decision): OrganizerDecision => ({ status: decision.to_status, note: decision.note || "", actorUserId: decision.actor_user_id, createdAt: decision.created_at })),
});

async function enrichApplications(rows: any[]): Promise<OrganizerApplication[]> {
  if (!rows.length) return [];
  const ids = rows.map((row) => row.id);
  const [{ data: communities, error: communitiesError }, { data: decisions, error: decisionsError }] = await Promise.all([
    supabase.from("organizer_application_communities").select("*").in("application_id", ids),
    supabase.from("organizer_decision_history").select("*").in("application_id", ids).order("created_at", { ascending: true }),
  ]);
  if (communitiesError) fail(communitiesError);
  if (decisionsError) fail(decisionsError);
  return rows.map((row) => mapApplication(row, (communities || []).filter((item: any) => item.application_id === row.id), (decisions || []).filter((item: any) => item.application_id === row.id)));
}

export async function getMyOrganizerApplication(): Promise<OrganizerApplication | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Connecte-toi pour consulter ta candidature.");
  const { data, error } = await supabase.from("organizer_applications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) fail(error);
  if (!data) return null;
  const [application] = await enrichApplications([data]);
  return { ...application, email: user.email || "" };
}

export async function submitOrganizerApplication(input: {
  legalName: string; country: string; professionalContact: string; communities: RequestedCommunity[]; termsAccepted: boolean;
}, submit: boolean): Promise<string> {
  const payload = input.communities.map((community) => ({ name: community.name, game_key: community.game, community_size: community.size || null, public_url: community.publicUrl, responsibility_proof_url: community.responsibilityProofUrl }));
  const { data, error } = await supabase.rpc("submit_organizer_application", {
    p_legal_name: input.legalName, p_country: input.country, p_professional_contact: input.professionalContact,
    p_communities: payload, p_terms_accepted: input.termsAccepted, p_submit: submit,
  });
  if (error) fail(error);
  return data as string;
}

export async function getOrganizerCommunities(): Promise<GamingCommunity[]> {
  const { data, error } = await supabase.from("gaming_communities").select("*").order("created_at", { ascending: false });
  if (error) fail(error);
  return (data || []).map((row: any) => ({ id: row.id, applicationId: row.application_id || "", name: row.name, game: row.game_key, organizerUserId: row.organizer_user_id, status: row.status, createdAt: row.created_at }));
}

export async function getCommunityInvitations(): Promise<CommunityInvitation[]> {
  const { data, error } = await supabase.from("community_invitations").select("*, gaming_communities(name,game_key,organizer_user_id)").order("created_at", { ascending: false });
  if (error) fail(error);
  return (data || []).map((row: any) => ({ id: row.id, communityId: row.community_id, communityName: row.gaming_communities?.name || "Communauté", game: row.gaming_communities?.game_key || "", organizerUserId: row.gaming_communities?.organizer_user_id || row.invited_by, invitedUsername: row.invited_username, invitedUserId: row.invited_user_id, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at }));
}

export async function getCommunityMemberships() {
  const { data, error } = await supabase.from("community_memberships").select("id,community_id,user_id,status,joined_at,ended_at,ended_by,profiles!community_memberships_profile_id_fkey(username,full_name)").order("joined_at", { ascending: false });
  if (error) fail(error);
  return data || [];
}

export async function createGamingCommunity(name: string, game: string, description: string): Promise<string> {
  const { data, error } = await supabase.rpc("create_gaming_community", { p_name: name, p_game_key: game, p_description: description || null });
  if (error) fail(error);
  return data as string;
}

export async function inviteCommunityMember(communityId: string, username: string): Promise<string> {
  const { data, error } = await supabase.rpc("invite_community_member", { p_community_id: communityId, p_username: username });
  if (error) fail(error);
  return data as string;
}

export async function respondCommunityInvitation(invitationId: string, accept: boolean): Promise<void> {
  const { error } = await supabase.rpc("respond_community_invitation", { p_invitation_id: invitationId, p_accept: accept });
  if (error) fail(error);
}

export async function removeCommunityMember(membershipId: string, reason?: string): Promise<void> {
  const { error } = await supabase.rpc("remove_community_member", { p_membership_id: membershipId, p_reason: reason || null });
  if (error) fail(error);
}

export async function getOrganizerApplicationsForAdmin(): Promise<OrganizerApplication[]> {
  const { data, error } = await supabase.from("organizer_applications").select("*").order("created_at", { ascending: false });
  if (error) fail(error);
  return enrichApplications(data || []);
}

export async function getAllGamingCommunitiesForAdmin(): Promise<GamingCommunity[]> {
  return getOrganizerCommunities();
}

export async function reviewOrganizerApplication(id: string, status: OrganizerStatus, note: string): Promise<void> {
  const { error } = await supabase.rpc("review_organizer_application", { p_application_id: id, p_status: status, p_note: note || null });
  if (error) fail(error);
}

export async function setOrganizerCommunityStatus(communityId: string, status: "active" | "suspended" | "archived", reason = ""): Promise<void> {
  const { error } = await supabase.rpc("set_organizer_community_status", { p_community_id: communityId, p_status: status, p_reason: reason || null });
  if (error) fail(error);
}
