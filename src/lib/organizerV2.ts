export type OrganizerStatus = "draft" | "submitted" | "under_review" | "more_info_requested" | "approved" | "rejected" | "suspended";
export type CommunityStatus = "active" | "suspended" | "archived";
export type InvitationStatus = "pending" | "accepted" | "declined" | "withdrawn";

export interface RequestedCommunity {
  id: string;
  name: string;
  game: string;
  size: string;
  publicUrl: string;
  responsibilityProofUrl: string;
}

export interface OrganizerDecision {
  status: OrganizerStatus;
  note: string;
  actorUserId: string | null;
  createdAt: string;
}

export interface OrganizerApplication {
  id: string;
  userId: string;
  email: string;
  applicantName: string;
  country: string;
  professionalContact: string;
  communities: RequestedCommunity[];
  termsAccepted: boolean;
  status: OrganizerStatus;
  adminNote: string;
  kycStatus: "disabled_pending_vendor" | "not_started" | "pending" | "verified" | "rejected";
  createdAt: string;
  updatedAt: string;
  decisions: OrganizerDecision[];
}

export interface GamingCommunity {
  id: string;
  applicationId: string;
  name: string;
  game: string;
  organizerUserId: string;
  status: CommunityStatus;
  createdAt: string;
}

export interface CommunityInvitation {
  id: string;
  communityId: string;
  communityName: string;
  game: string;
  organizerUserId: string;
  invitedUsername: string;
  invitedUserId: string;
  status: InvitationStatus;
  createdAt: string;
  updatedAt: string;
}

export const ORGANIZER_GAMES = [
  "Blood Strike", "Brawl Stars", "Clash of Clans", "Clash Royale", "COD Mobile",
  "eFootball Mobile", "Free Fire", "Mobile Legends", "PUBG Mobile",
];

export const ORGANIZER_STATUS_LABELS: Record<OrganizerStatus, { fr: string; en: string }> = {
  draft: { fr: "Brouillon", en: "Draft" },
  submitted: { fr: "Soumise", en: "Submitted" },
  under_review: { fr: "En vérification", en: "Under review" },
  more_info_requested: { fr: "Informations demandées", en: "More information requested" },
  approved: { fr: "Approuvée", en: "Approved" },
  rejected: { fr: "Refusée", en: "Rejected" },
  suspended: { fr: "Suspendue", en: "Suspended" },
};
