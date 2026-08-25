import { http } from "../http";
import { checklistEndpoints } from "./endpoints";
import type {
  AddChecklistMemberRequest,
  ApiResponse,
  Checklist,
  ChecklistItem,
  CreateChecklistItemRequest,
  CreateChecklistRequest,
  MoveChecklistItemRequest,
  UpdateChecklistItemRequest,
  UpdateChecklistRequest,
} from "./types";

function unwrap<TData>(response: ApiResponse<TData>) {
  return response.data;
}

function normalizeItem(item: ChecklistItem): ChecklistItem {
  return {
    ...item,
    children: (item.children ?? []).map(normalizeItem),
  };
}

function normalizeChecklist(checklist: Checklist | null | undefined) {
  if (!checklist) {
    return checklist;
  }

  return {
    ...checklist,
    members: checklist.members ?? [],
    items: (checklist.items ?? []).map(normalizeItem),
  };
}

export const checklistService = {
  async findAll() {
    const response = await http.get<ApiResponse<Checklist[]>>(
      checklistEndpoints.findAll
    );
    return (unwrap(response) ?? []).map((item) => normalizeChecklist(item)!);
  },

  async findById(id: string) {
    const response = await http.get<ApiResponse<Checklist>>(
      checklistEndpoints.findById(id)
    );
    return normalizeChecklist(unwrap(response));
  },

  async create(request: CreateChecklistRequest) {
    const response = await http.post<ApiResponse<Checklist>>(
      checklistEndpoints.create,
      request
    );
    return normalizeChecklist(unwrap(response));
  },

  async update(id: string, request: UpdateChecklistRequest) {
    const response = await http.put<ApiResponse<Checklist>>(
      checklistEndpoints.update(id),
      request
    );
    return normalizeChecklist(unwrap(response));
  },

  async delete(id: string) {
    await http.delete<ApiResponse<void>>(checklistEndpoints.delete(id));
  },

  async addMember(id: string, request: AddChecklistMemberRequest) {
    const response = await http.post<ApiResponse<Checklist>>(
      checklistEndpoints.members(id),
      request
    );
    return normalizeChecklist(unwrap(response));
  },

  async removeMember(id: string, userId: string) {
    const response = await http.delete<ApiResponse<Checklist>>(
      checklistEndpoints.member(id, userId)
    );
    return normalizeChecklist(unwrap(response));
  },

  async createItem(id: string, request: CreateChecklistItemRequest) {
    const response = await http.post<ApiResponse<Checklist>>(
      checklistEndpoints.items(id),
      request
    );
    return normalizeChecklist(unwrap(response));
  },

  async updateItem(
    id: string,
    itemId: string,
    request: UpdateChecklistItemRequest
  ) {
    const response = await http.put<ApiResponse<Checklist>>(
      checklistEndpoints.item(id, itemId),
      request
    );
    return normalizeChecklist(unwrap(response));
  },

  async moveItem(id: string, itemId: string, request: MoveChecklistItemRequest) {
    const response = await http.post<ApiResponse<Checklist>>(
      checklistEndpoints.moveItem(id, itemId),
      request
    );
    return normalizeChecklist(unwrap(response));
  },

  async toggleItem(id: string, itemId: string) {
    const response = await http.post<ApiResponse<Checklist>>(
      checklistEndpoints.toggleItem(id, itemId)
    );
    return normalizeChecklist(unwrap(response));
  },

  async deleteItem(id: string, itemId: string) {
    const response = await http.delete<ApiResponse<Checklist>>(
      checklistEndpoints.item(id, itemId)
    );
    return normalizeChecklist(unwrap(response));
  },
};
