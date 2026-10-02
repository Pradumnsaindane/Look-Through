import type { EntityRecord } from '../contracts'
export interface AiActionProposal extends EntityRecord { actionType: string; payload: unknown; status: 'pending' | 'approved' | 'rejected' | 'executed' }
export interface AiService { preview(input: unknown, organizationId: string): Promise<AiActionProposal>; approve(id: string, organizationId: string): Promise<AiActionProposal> }
export const aiModule = { name: 'ai', requiresApprovalForMutations: true } as const
