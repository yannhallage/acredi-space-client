import { useState } from "react";

type ProfileType = "DEVELOPER" | "COMMUNITY_MANAGER" | "VIDEASTE" | "GRAPHISTE";

interface InviteProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  profile: ProfileType;
  photo?: File | null;
}

interface InviteProfileStepProps {
  onPrevious: () => void;
  onNext: (data: InviteProfileData) => void;
}

export function InviteProfileStep({ onPrevious, onNext }: InviteProfileStepProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [profile, setProfile] = useState<ProfileType>("DEVELOPER");
  const [photo, setPhoto] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!firstName || !lastName || !phone || !address || !profile) {
      setMessage("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    onNext({
      firstName,
      lastName,
      phone,
      address,
      profile,
      photo,
    });
  }

  return (
    <div className="invite-page">
      <div className="invite-steps">
        <span />
        <span className="active" />
        <span />
      </div>

      <form className="invite-card" onSubmit={handleSubmit}>
        <h1>Informations personnelles</h1>

        <label className="invite-field">
          Prénom *
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Yann"
          />
        </label>

        <label className="invite-field">
          Nom *
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Hallage"
          />
        </label>

        <label className="invite-field">
          Photo
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          />
        </label>

        <label className="invite-field">
          Numéro de téléphone *
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+225 07 00 00 00 00"
          />
        </label>

        <label className="invite-field">
          Lieu d'habitation *
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Abidjan, Cocody"
          />
        </label>

        <label className="invite-field">
          Profil *
          <select
            value={profile}
            onChange={(e) => setProfile(e.target.value as ProfileType)}
          >
            <option value="DEVELOPER">Développeur</option>
            <option value="COMMUNITY_MANAGER">Community manager</option>
            <option value="VIDEASTE">Vidéaste</option>
            <option value="GRAPHISTE">Graphiste</option>
          </select>
        </label>

        {message && <p className="invite-error">{message}</p>}

        <div className="invite-actions invite-actions-between">
          <button type="button" className="invite-secondary" onClick={onPrevious}>
            Previous
          </button>

          <button type="submit">Next</button>
        </div>
      </form>
    </div>
  );
}
