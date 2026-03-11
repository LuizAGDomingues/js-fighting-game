import { AIController } from '../ai/AIController.js';
import { CHARACTER_ROSTER, getCharacterById } from '../config/characters/index.js';

export function createTowerState(playerId, initialDifficulty = 'medium') {
    const playerIndex = CHARACTER_ROSTER.findIndex(char => char.id === playerId);
    const orderedRoster = playerIndex >= 0
        ? CHARACTER_ROSTER.slice(playerIndex + 1).concat(CHARACTER_ROSTER.slice(0, playerIndex))
        : CHARACTER_ROSTER;

    return {
        playerId,
        initialDifficulty,
        opponentIds: orderedRoster
            .filter(char => char.id !== playerId)
            .map(char => char.id),
        currentOpponentIndex: 0
    };
}

export function getTowerOpponentId(towerState) {
    return towerState?.opponentIds?.[towerState.currentOpponentIndex] || null;
}

export function getTowerOpponentConfig(towerState) {
    const opponentId = getTowerOpponentId(towerState);
    return opponentId ? getCharacterById(opponentId) : null;
}

export function getTowerTotalFights(towerState) {
    return towerState?.opponentIds?.length || 0;
}

export function getTowerStage(towerState) {
    return (towerState?.currentOpponentIndex || 0) + 1;
}

export function getTowerProgress(towerState) {
    const totalFights = getTowerTotalFights(towerState);
    if (totalFights <= 1) return 1;

    return Math.min(1, (towerState.currentOpponentIndex || 0) / (totalFights - 1));
}

export function isTowerComplete(towerState) {
    const totalFights = getTowerTotalFights(towerState);
    if (!totalFights) return false;

    return (towerState.currentOpponentIndex || 0) >= totalFights - 1;
}

export function advanceTowerState(towerState) {
    return {
        ...towerState,
        currentOpponentIndex: Math.min(
            (towerState.currentOpponentIndex || 0) + 1,
            Math.max(0, getTowerTotalFights(towerState) - 1)
        )
    };
}

export function restartTowerState(towerState) {
    return {
        ...towerState,
        currentOpponentIndex: 0
    };
}

export function createTowerAIController(towerState) {
    return new AIController(towerState?.initialDifficulty || 'medium', {
        towerProgress: getTowerProgress(towerState)
    });
}

export function getTowerPreviewOpponentIndex(playerIndex) {
    if (CHARACTER_ROSTER.length <= 1) return 0;
    return (playerIndex + 1) % CHARACTER_ROSTER.length;
}
