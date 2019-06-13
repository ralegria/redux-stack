import { authGet, authPost, authDelete, authPut } from '../request';
import { takeEvery, call, put } from 'redux-saga/effects';
import {
  GET_USER_CLASSES,
  CREATE_NEW_CLASS,
  DELETE_CLASS,
  UPDATE_CLASS,
  GET_CLASS,
  GET_CLASS_WITH_FILTER,
} from '../constants/classes';
import { normalizeClasses, normalizeClass } from '../normalize/class';
import {
  getUserClassesFail,
  getUserClassesSuccess,
  createNewClassFail,
  createNewClassSuccess,
  deleteClassFail,
  deleteClassSuccess,
  updateClassFail,
  updateClassSuccess,
  getClassSuccess,
  getClassFail,
  getClassWithFilterFail,
  getClassWithFilterSuccess
} from '../actions/classes';
import { updateUserList } from '../actions/users';
import { updateGameList } from '../actions/games';

function* getUserClasses(action) {
  const { id, cb } = action;
  const { response, error } = yield call(authGet, `users/${id}/classes`);
  if (error) {
    yield put(getUserClassesFail(error));
  } else {
    const { entities: { classes } } = normalizeClasses(response);
    cb && cb(response);
    yield put(getUserClassesSuccess(classes));
  }
}

function* createNewClass(action) {
  const { userId, data, cb } = action;
  const { response, error } = yield call(authPost, `users/${userId}/classes`, data);

  if (error) {
    yield put(createNewClassFail(error));
    cb(error);
  } else {
    const { entities: { classes } } = normalizeClass(response);
    yield put(createNewClassSuccess(classes));
    cb();
  }
}


function* deleteClass(action) {
  const { userId, classId, data } = action;
  const { error } = yield call(authDelete, `users/${userId}/classes/${classId}`, data);
  if (error) {
    yield put(deleteClassFail(error));
  } else {
    yield put(deleteClassSuccess(classId));
  }
}


function* updateClass(action) {
  const { classId, data, cb } = action;
  const { response, error } = yield call(authPut, `classes/${classId}`, data);

  if (error) {
    yield put(updateClassFail(error));
    cb && cb(error);
  } else {
    const { entities: { classes } } = normalizeClass(response);
    yield put(updateClassSuccess(classes));
    cb && cb();
  }
}

function* getClass(action) {
  const { classId } = action;
  const { response, error } = yield call(authGet, `classes/${classId}`);
  if (error) {
    yield put(getClassFail(error));
  } else {
    const { entities: { classes } } = normalizeClass(response);
    yield put(getClassSuccess(classes));
  }
}


function* getClassWithFilter(action) {
  const { classId, filter } = action;
  const { response, error } = yield call(authGet, `classes/${classId}`, {
    filter: JSON.stringify({
      ...filter
    })
  });
  if (error) {
    yield put(getClassWithFilterFail(error));
  } else {
    const { entities: { games, users, classes } } = normalizeClass(response);
    yield put(getClassWithFilterSuccess(classes));
    yield put(updateUserList(users));
    yield put(updateGameList(games));

  }
}

export function* classRootSagas(){
  yield takeEvery(GET_USER_CLASSES.REQUEST, getUserClasses);
  yield takeEvery(CREATE_NEW_CLASS.REQUEST, createNewClass);
  yield takeEvery(DELETE_CLASS.REQUEST, deleteClass);
  yield takeEvery(UPDATE_CLASS.REQUEST, updateClass);
  yield takeEvery(GET_CLASS.REQUEST, getClass);
  yield takeEvery(GET_CLASS_WITH_FILTER.REQUEST, getClassWithFilter);
}