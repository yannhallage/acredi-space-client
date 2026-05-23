import { ScaffoldPanel } from '../../../shared/components/ScaffoldPanel'

export function ShareFileDialog() {
  return <ScaffoldPanel name="ShareFileDialog" description="Choix prive, equipe ou partage specifique." />
}

export function UserPermissionPicker() {
  return <ScaffoldPanel name="UserPermissionPicker" description="Selection utilisateurs et niveau d'acces." />
}

export function TeamPermissionPicker() {
  return <ScaffoldPanel name="TeamPermissionPicker" description="Selection equipe et permission associee." />
}

export function AccessRevocationDialog() {
  return <ScaffoldPanel name="AccessRevocationDialog" description="Confirmation de revocation d'acces." />
}

export function PermissionMatrix() {
  return <ScaffoldPanel name="PermissionMatrix" description="Matrice role, visibilite et permission fichier." />
}
