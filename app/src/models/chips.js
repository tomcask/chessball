import {freeze} from 'freezr'
import {createChip} from './chip'

const chipsPrototype = {
  getChip (id) {
    return this.list.find((chip) => chip.id === id)
  },

  getChipIndex (id) {
    return this.list.findIndex((chip) => chip.id === id)
  },

  getBall () {
    return this.list.find((chip) => chip.isBall())
  },

  getBallOwner () {
    return this.getBall().team
  },

  getSelectedChip () {
    return this.list.find((chip) => chip.isSelected)
  },

  getSelectableTeam () {
    return this.list
      .find(({selectable}) => selectable).team
  },

  setChip (chipId, callback) {
    const index = this.getChipIndex(chipId)
    const newChips = this.list.updateIn(
      [index],
      callback
    )
    return this.set('list', newChips)
  },

  setTeamSelectable (team) {
    const newChips = this.list.map((chip) => {
      if (chip.isBall()) return chip
      else return chip.setSelectable(true)
    })
    return this.set('list', newChips)
  },

  setBallSelectable () {
    const newChips = this.list.map((chip) => {
      if (chip.isBall) return chip.setSelectable(true)
      else return chip
    })
    return this.set('list', newChips)
  },

  moveChip (chipId, position) {
    return this.setChip(chipId, (chip) => chip.move(position))
  },

  unselectChip () {
    const selectedChip = this.getSelectedChip()
    if (!selectedChip) return this
    return this.setChip(
      selectedChip.id,
      (chip) => chip.unselect()
    )
  },

  selectChip (chipId) {
    return this.setChip(chipId, (chip) => chip.select())
  }
}

export function createChips (rawData) {
  const list = freeze(rawData.map(createChip))
  return freeze({
    list,
    ...chipsPrototype
  })
}