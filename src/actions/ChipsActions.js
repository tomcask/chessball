// import ChessballDispatcher from '../dispatcher/ChessballDispatcher'
//
// const MOVE_CHIP = 'MOVE_CHIP'
//
// export function moveChip (chipId, top, left) {
//   ChessballDispatcher.dispatch({
//     type: MOVE_CHIP,
//     payload: {chipId, top, left}
//   })
// }
export const MOVE_CHIP = 'MOVE_CHIP'

export function moveChip (chipId, top, left) {
  return {
    type: MOVE_CHIP,
    chipId,
    top,
    left
  }
}
