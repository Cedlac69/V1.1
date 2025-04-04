import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Script de migration pour mettre à jour les numéros de mission existants
 * Nouveau format: AGENCE0001 (code agence + numéro séquentiel sur 4 chiffres)
 */
export async function updateMissionNumbers() {
  try {
    console.log('Début de la migration des numéros de mission...');
    
    // Obtenir toutes les missions
    const ordersCollection = collection(db, 'clientOrders');
    const snapshot = await getDocs(ordersCollection);
    
    // Compteur pour chaque agence
    const counters: Record<string, number> = {};
    
    // Premièrement, analyse toutes les missions pour déterminer les compteurs par agence
    const missions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Trier par date de création pour maintenir l'ordre chronologique
    missions.sort((a, b) => {
      // Utiliser startDate comme approximation de l'ordre de création
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    console.log(`Nombre de missions à migrer: ${missions.length}`);

    // Parcourir les missions et mettre à jour les numéros
    for (const mission of missions) {
      // Déterminer le code d'agence pour cette mission
      const agencyCode = mission.agencyCode || 'UNKN';
      
      // Si c'est la première mission pour cette agence, initialiser le compteur
      if (!counters[agencyCode]) {
        counters[agencyCode] = 1;
      } else {
        counters[agencyCode]++;
      }
      
      // Créer le nouveau numéro de mission
      const newMissionNumber = `${agencyCode}${String(counters[agencyCode]).padStart(4, '0')}`;
      
      console.log(`Mise à jour de la mission ${mission.id}: ${mission.missionNumber || 'Sans numéro'} -> ${newMissionNumber}`);
      
      // Mettre à jour la mission dans la base de données
      const missionRef = doc(db, 'clientOrders', mission.id);
      await updateDoc(missionRef, { 
        missionNumber: newMissionNumber,
        agencyCode: agencyCode
      });
    }
    
    console.log('Migration terminée avec succès!');
    console.log('Nouveaux compteurs par agence:', counters);
    
    return { success: true, counters };
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    return { success: false, error };
  }
}