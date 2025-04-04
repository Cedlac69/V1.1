import React, { useState } from 'react';
import { updateMissionNumbers } from '../updateMissionNumbers';
import { Printer } from 'lucide-react';

export function MigrateMissionNumbersButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; counters?: Record<string, number> } | null>(null);

  const handleMigration = async () => {
    // Demander confirmation avant de procéder
    const confirmed = window.confirm(
      "Cette opération va mettre à jour TOUS les numéros de mission existants avec le nouveau format utilisant le code agence. Cette action est irréversible. Voulez-vous continuer?"
    );

    if (!confirmed) return;

    setIsLoading(true);
    setResult(null);

    try {
      const migrationResult = await updateMissionNumbers();
      
      if (migrationResult.success) {
        setResult({
          success: true,
          message: "Migration réussie ! Tous les numéros de mission ont été mis à jour.",
          counters: migrationResult.counters
        });
      } else {
        setResult({
          success: false,
          message: "Erreur lors de la migration. Consultez la console pour plus de détails."
        });
      }
    } catch (error) {
      console.error("Erreur lors de la migration:", error);
      setResult({
        success: false,
        message: `Erreur: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="my-6">
      <button
        onClick={handleMigration}
        disabled={isLoading}
        className="bg-[#005d92] hover:bg-[#004b76] text-white font-medium py-2 px-4 rounded-lg
                  border border-[#004b76] hover:border-[#003a5c] 
                  transition-all duration-200 shadow-sm flex items-center gap-2"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Printer className="w-5 h-5" />
        )}
        <span>{isLoading ? "Migration en cours..." : "Migrer les numéros de mission"}</span>
      </button>

      {result && (
        <div className={`mt-4 p-4 rounded-lg ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          <p className="font-medium">{result.message}</p>
          
          {result.success && result.counters && (
            <div className="mt-2">
              <p className="font-medium">Compteurs par agence:</p>
              <ul className="mt-1 space-y-1">
                {Object.entries(result.counters).map(([agencyCode, count]) => (
                  <li key={agencyCode}>
                    {agencyCode}: {count} mission{count > 1 ? 's' : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}