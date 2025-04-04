/*
  # Création de la table des qualifications

  1. Nouvelle Table
    - `roles`
      - `id` (uuid, clé primaire)
      - `qualification` (text)
      - `acronym` (text)

  2. Sécurité
    - Activation de RLS
    - Politique pour permettre la lecture à tous les utilisateurs authentifiés
    - Politique pour permettre la modification aux administrateurs uniquement
*/

CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qualification text NOT NULL,
  acronym text NOT NULL,
  UNIQUE(qualification)
);

-- Activation de RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Politique de lecture pour les utilisateurs authentifiés
CREATE POLICY "Lecture des qualifications pour les utilisateurs authentifiés"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Politique de modification pour les administrateurs
CREATE POLICY "Modification des qualifications pour les administrateurs"
  ON roles
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Index pour améliorer les performances
CREATE INDEX roles_qualification_idx ON roles(qualification);
CREATE INDEX roles_acronym_idx ON roles(acronym);