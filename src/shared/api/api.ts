import { authService, normalizeAuthUser, unwrapApiResponse } from "./auth";
import type { AuthResponse, LoginResponse } from "./auth";
import type { User } from "../types";

export const api = {
  async getNotes(q = "", archived = false) {

  const token = localStorage.getItem("accessToken");

  const params = new URLSearchParams();

  params.set("archived", String(archived));

  if (q) {
    params.set("q", q);
  }

  const response = await fetch(
    `${API_URL}/notes?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Impossible de charger les notes");
  }

  const result = await response.json();

  return result.data;
},

async getNoteById(id: string) {

  const token = localStorage.getItem("accessToken");

  const response = await fetch(
    `${API_URL}/notes/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Impossible de charger la note");
  }

  const result = await response.json();

  return result.data;
},

async createNote(payload: {
  title: string;
  content: string;
  visibility?: "PRIVATE" | "TEAM" | "PUBLIC";
  color?: string;
}) {

  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_URL}/notes`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Impossible de créer la note");
  }

  const result = await response.json();

  return result.data;
},

async updateNote(
  id: string,
  payload: {
    title?: string;
    content?: string;
    visibility?: "PRIVATE" | "TEAM" | "PUBLIC";
    color?: string;
  }
) {

  const token = localStorage.getItem("accessToken");

  const response = await fetch(
    `${API_URL}/notes/${id}`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("Impossible de modifier la note");
  }

  const result = await response.json();

  return result.data;
},

async archiveNote(id: string) {

  const token = localStorage.getItem("accessToken");

  const response = await fetch(
    `${API_URL}/notes/${id}/archive`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Impossible d'archiver la note");
  }

  const result = await response.json();

  return result.data;
},

async restoreNote(id: string) {

  const token = localStorage.getItem("accessToken");

  const response = await fetch(
    `${API_URL}/notes/${id}/restore`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Impossible de restaurer la note");
  }

  const result = await response.json();

  return result.data;
},

async pinNote(id: string) {

  const token = localStorage.getItem("accessToken");

  const response = await fetch(
    `${API_URL}/notes/${id}/pin`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Impossible d'épingler la note");
  }

  const result = await response.json();

  return result.data;
},

async unpinNote(id: string) {

  const token = localStorage.getItem("accessToken");

  const response = await fetch(
    `${API_URL}/notes/${id}/unpin`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Impossible de désépingler la note");
  }

  const result = await response.json();

  return result.data;
},

async deleteNote(id: string) {

  const token = localStorage.getItem("accessToken");

  const response = await fetch(
    `${API_URL}/notes/${id}`,
    {
      method: "DELETE",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Impossible de supprimer la note");
  }

  return true;
},
};

<<<<<<< HEAD
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${API_URL}/auth/me`, {

      headers: {
        Authorization: `Bearer ${token}`
      }

    });

    if (!response.ok) {
      throw new Error('Non authentifié');
    }

    return response.json();
  },
  async getUsers() {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(`${API_URL}/users`, {
      headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Impossible de charger les utilisateurs");
  }
  return response.json();
}


};


=======
export * from "./auth";
export * from "./http";
export * from "./users";
>>>>>>> origin/feature/ready
