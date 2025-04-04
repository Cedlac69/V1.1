/*
  # Création de la table des consultants

  1. Nouvelle Table
    - `consultants`
      - `id` (uuid, clé primaire)
      - `name` (text)
      - `surname` (text)
      - `role` (text, référence roles.qualification)
      - `skills` (jsonb)
      - `certifications` (jsonb)
      - `hourly_rate` (numeric)
      - `preferred_locations` (jsonb)
      - `agency_code` (text, référence agencies.code)
      - `availability` (jsonb)

  2. Sécurité
    - Activation de RLS
    - Politique pour permettre la lecture aux utilisateurs de la même agence
    - Politique pour permettre la modification aux administrateurs et managers
*/

CREATE TABLE IF NOT EXISTS consultants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  surname text NOT NULL,
  role text NOT NULL REFERENCES roles(qualification),
  skills jsonb DEFAULT '[]'::jsonb,
  certifications jsonb DEFAULT '[]'::jsonb,
  hourly_rate numeric(10,2),
  preferred_locations jsonb DEFAULT '[]'::jsonb,
  agency_code text REFERENCES agencies(code),
  availability jsonb DEFAULT '{}'::jsonb
);

-- Activation de RLS
ALTER TABLE consultants ENABLE ROW LEVEL SECURITY;

-- Politique de lecture pour les utilisateurs de la même agence
CREATE POLICY "Lecture des consultants de son agence"
  ON consultants
  FOR SELECT
  TO authenticated
  USING (
    agency_code IN (
      SELECT a.code 
      FROM agencies a 
      JOIN users u ON u.agency_id = a.id 
      WHERE u.id = auth.uid()
    )
    OR auth.jwt() ->> 'role' IN ('admin', 'manager')
  );

-- Politique de modification pour les administrateurs et managers
CREATE POLICY "Modification des consultants pour admin et manager"
  ON consultants
  USING (auth.jwt() ->> 'role' IN ('admin', 'manager'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'manager'));

-- Index pour améliorer les performances
CREATE INDEX consultants_agency_code_idx ON consultants(agency_code);
CREATE INDEX consultants_role_idx ON consultants(role);
CREATE INDEX consultants_name_surname_idx ON consultants(name, surname);