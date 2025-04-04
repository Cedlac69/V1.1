/*
  # Création de la table des clients

  1. Nouvelle Table
    - `clients`
      - `id` (uuid, clé primaire)
      - `name` (text)
      - `address` (text)
      - `postal_code` (text)
      - `city` (text)

  2. Sécurité
    - Activation de RLS
    - Politique pour permettre la lecture à tous les utilisateurs authentifiés
    - Politique pour permettre la modification aux administrateurs uniquement
*/

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  postal_code text,
  city text,
  UNIQUE(name)
);

-- Activation de RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Politique de lecture pour les utilisateurs authentifiés
CREATE POLICY "Lecture des clients pour les utilisateurs authentifiés"
  ON clients
  FOR SELECT
  TO authenticated
  USING (true);

-- Politique de modification pour les administrateurs
CREATE POLICY "Modification des clients pour les administrateurs"
  ON clients
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Index pour améliorer les performances
CREATE INDEX clients_name_idx ON clients(name);
CREATE INDEX clients_city_idx ON clients(city);