/*
  # Création de la table des utilisateurs

  1. Nouvelle Table
    - `users`
      - `id` (uuid, clé primaire)
      - `email` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `agency_id` (uuid, clé étrangère vers agencies)
      - `role` (enum: admin, manager, user)
      - `active` (boolean)
      - `last_login` (timestamp)
      - `created_at` (timestamp)

  2. Sécurité
    - Activation de RLS sur la table `users`
    - Politique pour permettre aux administrateurs de tout faire
    - Politique pour permettre aux utilisateurs de lire leurs propres données
*/

-- Création de l'enum pour les rôles
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'user');

-- Création de la table users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  agency_id uuid REFERENCES agencies(id) ON DELETE SET NULL,
  role user_role NOT NULL DEFAULT 'user',
  active boolean NOT NULL DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Activation de RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Politique pour les administrateurs
CREATE POLICY "Les administrateurs peuvent tout faire"
  ON users
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Politique pour la lecture des données personnelles
CREATE POLICY "Les utilisateurs peuvent lire leurs propres données"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Index pour améliorer les performances
CREATE INDEX users_email_idx ON users(email);
CREATE INDEX users_agency_id_idx ON users(agency_id);
CREATE INDEX users_role_idx ON users(role);