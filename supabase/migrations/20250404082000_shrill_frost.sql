/*
  # Création de la table des agences

  1. Nouvelle Table
    - `agencies`
      - `id` (uuid, clé primaire)
      - `name` (text)
      - `code` (text, unique, 4 caractères)
      - `address` (text)
      - `phone` (text)
      - `email` (text)

  2. Sécurité
    - Activation de RLS
    - Politique pour permettre la lecture à tous les utilisateurs authentifiés
    - Politique pour permettre la modification aux administrateurs uniquement
*/

CREATE TABLE IF NOT EXISTS agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL CHECK (length(code) = 4),
  address text,
  phone text,
  email text,
  UNIQUE(code)
);

-- Activation de RLS
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;

-- Politique de lecture pour les utilisateurs authentifiés
CREATE POLICY "Lecture des agences pour les utilisateurs authentifiés"
  ON agencies
  FOR SELECT
  TO authenticated
  USING (true);

-- Politique de modification pour les administrateurs
CREATE POLICY "Modification des agences pour les administrateurs"
  ON agencies
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Index pour améliorer les performances
CREATE INDEX agencies_code_idx ON agencies(code);