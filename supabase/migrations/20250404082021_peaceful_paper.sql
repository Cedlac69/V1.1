/*
  # Création de la table des missions

  1. Nouvelle Table
    - `client_orders`
      - `id` (uuid, clé primaire)
      - `mission_number` (text, unique)
      - `mission_type` (enum: PLA, INT, VAC)
      - `client_name` (text, référence clients.name)
      - `project_name` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `required_skills` (jsonb)
      - `required_certifications` (jsonb)
      - `status` (enum: pending, cancelled_client, cancelled_consultant, completed)
      - `assigned_consultant_id` (uuid, référence consultants.id)
      - `contract_reason` (text)
      - `cancellation_reason` (text)
      - `comments` (text)
      - `is_temporary` (boolean)
      - `qualification` (text, référence roles.qualification)
      - `created_by` (text)
      - `agency_code` (text, référence agencies.code)
      - `created_at` (timestamptz)

  2. Sécurité
    - Activation de RLS
    - Politique pour permettre la lecture aux utilisateurs de la même agence
    - Politique pour permettre la modification aux utilisateurs de la même agence
*/

-- Création des types enum
CREATE TYPE mission_type AS ENUM ('PLA', 'INT', 'VAC');
CREATE TYPE mission_status AS ENUM ('pending', 'cancelled_client', 'cancelled_consultant', 'completed');

CREATE TABLE IF NOT EXISTS client_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_number text UNIQUE NOT NULL,
  mission_type mission_type NOT NULL,
  client_name text NOT NULL REFERENCES clients(name),
  project_name text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  required_skills jsonb DEFAULT '[]'::jsonb,
  required_certifications jsonb DEFAULT '[]'::jsonb,
  status mission_status NOT NULL DEFAULT 'pending',
  assigned_consultant_id uuid REFERENCES consultants(id),
  contract_reason text,
  cancellation_reason text,
  comments text,
  is_temporary boolean NOT NULL DEFAULT false,
  qualification text NOT NULL REFERENCES roles(qualification),
  created_by text,
  agency_code text REFERENCES agencies(code),
  created_at timestamptz DEFAULT now(),

  -- Contrainte pour s'assurer que end_date est >= start_date
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Activation de RLS
ALTER TABLE client_orders ENABLE ROW LEVEL SECURITY;

-- Politique de lecture pour les utilisateurs de la même agence
CREATE POLICY "Lecture des missions de son agence"
  ON client_orders
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

-- Politique de modification pour les utilisateurs de la même agence
CREATE POLICY "Modification des missions de son agence"
  ON client_orders
  USING (
    agency_code IN (
      SELECT a.code 
      FROM agencies a 
      JOIN users u ON u.agency_id = a.id 
      WHERE u.id = auth.uid()
    )
    OR auth.jwt() ->> 'role' IN ('admin', 'manager')
  )
  WITH CHECK (
    agency_code IN (
      SELECT a.code 
      FROM agencies a 
      JOIN users u ON u.agency_id = a.id 
      WHERE u.id = auth.uid()
    )
    OR auth.jwt() ->> 'role' IN ('admin', 'manager')
  );

-- Index pour améliorer les performances
CREATE INDEX client_orders_mission_number_idx ON client_orders(mission_number);
CREATE INDEX client_orders_client_name_idx ON client_orders(client_name);
CREATE INDEX client_orders_agency_code_idx ON client_orders(agency_code);
CREATE INDEX client_orders_status_idx ON client_orders(status);
CREATE INDEX client_orders_start_date_idx ON client_orders(start_date);
CREATE INDEX client_orders_qualification_idx ON client_orders(qualification);
CREATE INDEX client_orders_assigned_consultant_idx ON client_orders(assigned_consultant_id);