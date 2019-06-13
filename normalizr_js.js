import { normalize, schema } from 'normalizr';
import { classSchema } from './class';
import { roundParameterSchema } from './roundParameters';
import { resultSchema } from './results';

export const gameSchema = new schema.Entity('games', {
    class: classSchema,
    roundParameters: [roundParameterSchema],
    results: [resultSchema]
}, { idAttribute: 'gameId' });

export const normalizeGame = (game) => {
    return normalize(game, gameSchema);
}

export const normalizeGameList = (games) => {
    return normalize(games, [gameSchema]);
}
