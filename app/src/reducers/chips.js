import {createChips} from 'src/models/chips'
import createReducer from 'src/lib/createReducer'
import {distance} from 'src/models/position'
import switchTeam from 'src/lib/switchTeam'
import {freeze} from 'freezr'
import {
  SELECT_CHIP,
  MOVE_SELECTED_CHIP,
  SCORE,
  TEAM_A,
  TEAM_B,
  PLAYER,
  MOVE_PLAYER,
  BALL
} from 'src/constants'

const initialState = createChips([
  {position: [7, 5], team: null, selectable: false, type: BALL},
  {position: [2, 5], team: TEAM_A, selectable: true, type: PLAYER, isKeeper: true},
  {position: [4, 3], team: TEAM_A, selectable: true, type: PLAYER},
  {position: [4, 7], team: TEAM_A, selectable: true, type: PLAYER},
  {position: [6, 1], team: TEAM_A, selectable: true, type: PLAYER},
  {position: [6, 9], team: TEAM_A, selectable: true, type: PLAYER},
  {position: [12, 5], team: TEAM_B, selectable: false, type: PLAYER, isKeeper: true},
  {position: [10, 3], team: TEAM_B, selectable: false, type: PLAYER},
  {position: [10, 7], team: TEAM_B, selectable: false, type: PLAYER},
  {position: [8, 1], team: TEAM_B, selectable: false, type: PLAYER},
  {position: [8, 9], team: TEAM_B, selectable: false, type: PLAYER}
])

const reducerMap = {
  [SELECT_CHIP]: (state, {chipId}) => {
    const selectedChip = state.getSelectedChip()
    if (!selectedChip) return state.selectChip(chipId)
    if (selectedChip.id === chipId) return state.unselectChip()
    else return state.unselectChip().selectChip(chipId)
  },
  [MOVE_SELECTED_CHIP]: (state, {position, team}) => {
    const selectedPlayerIndex = state.findIndex(({isSelected}) => isSelected)
    if (selectedPlayerIndex < 0) return state

    const forbiddenPositions = getPositions(state)
    if (positionIsInList(position, forbiddenPositions)) {
      return state.setIn([selectedPlayerIndex, 'isSelected'], false)
    }
    /* Apply Movement */
    const stateWithMove = state.updateIn(
      [selectedPlayerIndex],
      (chip) => chip.merge({
        isSelected: false,
        position: freeze(position)
      })
      )
    /* Set state after Movement */
    const nextBallOwner = getBallOwner(stateWithMove)
    if (nextBallOwner) {
      return stateWithMove.map((chip) =>
        chip.type === PLAYER
          ? chip.set('selectable', false)
          : chip.merge({
            team: nextBallOwner,
            isSelected: false,
            selectable: true
          })
      )
    } else {
      const nextTurnOwner = switchTeam(team)
      return stateWithMove.map((chip) =>
        chip.type === BALL
        ? chip.merge({'selectable': false, team: null})
        : chip.set('selectable', chip.team === nextTurnOwner)
      )
    }
  },
  [SCORE]: (state, action) => {
    const {team} = action
    const teamReceivesGoal = switchTeam(team)
    return initialState.map(
      (chip) => chip.set('selectable', chip.team === teamReceivesGoal)
    )
  },
  [MOVE_PLAYER]: (state, {payload: {position}}) => {
    const selectedChip = state.getSelectedChip()
    const stateWithMovement = state
      .moveChip(selectedChip.id, position)
      .unselectChip()
    const newBallOwner = stateWithMovement.getBall()
      .position.owner(stateWithMovement)
    if (newBallOwner) {
      return stateWithMovement
        .setBallOwner(newBallOwner)
        .setBallSelectable()
    } else {
      const selectableTeam = switchTeam(selectedChip.team)
      return stateWithMovement
        .setTeamSelectable(selectableTeam)
    }
  }
}

function positionIsInList (position, list) {
  const [a, b] = position
  return !!list.find(([aa, bb]) => a === aa && b === bb)
}

function getPositions (chips) {
  return chips.map(({position}) => position)
}

export default createReducer(reducerMap, initialState)
