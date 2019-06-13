import {
    GET_USER_GAMES,
    GET_GAME_BY_ID,
    GET_CLASS_GAMES,
    GET_GAMES_HOTEL_BY_CLASS,
    CREATE_NEW_GAME,
    SELECT_GAME,
    UPDATE_GAME_LIST,
    ADD_HOTEL_TO_GAME,
    REMOVE_HOTEL_FROM_GAME,
    UPDATE_GAME,
    DELETE_GAME,
    CLEAR_GAME,
    RUN_ROUND,
    CREATE_COMPUTER_GAME,
    GET_GAME_WITH_FILTER,
    UPDATE_COMPUTER_GAME
} from '../constants/games';
import { get } from 'lodash';

function initialState() {
    return {
        byId: {},
        loading: false,
        runRoundLoading: false
    };
};

export const games = (state = initialState(), action) => {
    let game = undefined;
    let users = [];
    let currentRound = null;
    switch (action.type) {
        case GET_USER_GAMES.REQUEST:
        case GET_GAME_BY_ID.REQUEST:
        case GET_GAMES_HOTEL_BY_CLASS.REQUEST:
        case GET_GAME_WITH_FILTER.REQUEST:
            return { ...state, loading: true };
        case GET_GAMES_HOTEL_BY_CLASS.SUCCESS:
        case GET_USER_GAMES.SUCCESS:
        case UPDATE_GAME_LIST:
        case GET_GAME_WITH_FILTER.SUCCESS:
        case UPDATE_COMPUTER_GAME.SUCCESS:
            return { ...state, loading: false, byId: { ...state.byId, ...action.data } };
        case GET_GAME_BY_ID.SUCCESS:
            return { ...state, loading: false, byId: { ...state.byId, ...action.game } }
        case CREATE_NEW_GAME.SUCCESS:
            return { ...state, byId: action.data }
        case SELECT_GAME:
            return { ...state, selected: Number(action.selected) }
        case CLEAR_GAME:
            return { ...state, byId: {} }
        case GET_CLASS_GAMES.SUCCESS:
            return { ...state, byId: action.games };
        case UPDATE_GAME.SUCCESS:
        case CREATE_COMPUTER_GAME.SUCCESS:
            return { ...state, loading: false, byId: { ...state.byId, ...action.data } }
        case DELETE_GAME.SUCCESS:
            const byId = Object.keys(state.byId).reduce((accumulator, key) => {
                const id = Number(key);
                if (id !== action.id) {
                    accumulator[id] = state.byId[id];
                }
                return accumulator;
            }, {});
            return {
                ...state,
                byId: {
                    ...byId
                }
            };
        case RUN_ROUND.SUCCESS:
            game = get(state, `byId.${action.gameId}`, {});
            currentRound = get(game, `currentRound`, null);
            currentRound = (action.round < currentRound) ? currentRound : currentRound + 1;
            return { ...state, runRoundLoading: false, byId: { ...state.byId, [action.gameId]: { ...game, currentRound } } }

        case GET_USER_GAMES.FAILURE:
        case GET_GAME_BY_ID.FAILURE:
        case UPDATE_COMPUTER_GAME.FAILURE:
        case CREATE_COMPUTER_GAME.FAILURE:
            return { ...state, loading: false, error: action.error };
        case GET_CLASS_GAMES.SUCCESS:
            return { ...state, byId: action.games };
        case REMOVE_HOTEL_FROM_GAME.SUCCESS:
            game = get(state, `byId.${action.gameId}`, {})
            users = get(game, 'users', []);
            users = users.filter((user) => user !== action.userId);
            return { ...state, byId: { ...state.byId, [action.gameId]: { ...game, users } } }
        case ADD_HOTEL_TO_GAME.SUCCESS:
            game = get(state, `byId.${action.gameId}`, {});
            users = get(game, 'users', []);
            users.push(Number(action.userId));
            return { ...state, byId: { ...state.byId, [action.gameId]: { ...game, users } } }
        case RUN_ROUND.REQUEST:
            return { ...state, runRoundLoading: true };
        case RUN_ROUND.FAILURE:
            return { ...state, runRoundLoading: false, error: action.error };
        default:
            return state;
    }
}

