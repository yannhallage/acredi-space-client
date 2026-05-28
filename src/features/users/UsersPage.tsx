import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal, Search } from "lucide-react";
import { api } from "../../shared/api/api";
import type { AppUser } from "./users.types";

export function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      setMessage("");

      const data = await api.getUsers();

      console.log("USERS RESPONSE:", data);

      setUsers(data);
    } catch (error: any) {
      console.error(error);
      setMessage(error?.message || "Impossible de charger les utilisateurs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const value = `${user.firstName} ${user.lastName} ${user.email} ${user.role}`.toLowerCase();
      return value.includes(search.toLowerCase());
    });
  }, [users, search]);

  return (
    <div className="page-stack users-page">
      <div className="page-header compact">
        <div>
          <span className="eyebrow">Administration</span>
          <h1>Utilisateurs</h1>
          <p>Gérez les comptes, rôles et accès de votre application.</p>
        </div>
      </div>

      <div className="card">
        <div className="toolbar-row">
          <div className="search-box">
            <Search size={16} />
            <input
              placeholder="Rechercher un utilisateur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {message && <p className="auth-error">{message}</p>}

        {loading ? (
          <div className="state-panel">
            <div className="loader-dot" />
            <span>Chargement des utilisateurs...</span>
          </div>
        ) : (
          <div className="users-list">
            {filteredUsers.map((user) => (
              <div className="users-row" key={user.id}>
                <div className="users-initial">
                  {user.firstName?.charAt(0)}
                </div>

                <div className="users-person">
                  <strong>
                    {user.firstName} {user.lastName}
                  </strong>
                  <span>{user.email}</span>
                </div>

                <button className="users-role">{user.role}</button>

                <button className="icon-button users-more">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="state-panel">
                <strong>Aucun utilisateur trouvé</strong>
                <span>Essayez avec un autre nom ou email.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}