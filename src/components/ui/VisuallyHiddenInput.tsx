import { styled } from '@mui/material'

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: 1,
  height: 1,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
})

export default VisuallyHiddenInput
