import React from 'react'
import {connect} from 'react-redux'
import Chip from 'src/components/Chip'

const Chips = ({chips}) => {
  console.log('chips', chips)
  return (
    <div style={{position: 'relative'}}>
    {chips.map((chip, i) =>
      <Chip key={i} {...chip} />
    )}
    </div>
  )
}

const mapStateToProps = (state) => ({
  chips: state.chips
})

export default connect(mapStateToProps)(Chips)
