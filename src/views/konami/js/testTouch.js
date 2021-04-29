const ttt = ((this.start_x - this.stop_x) < 0) ? (() => {
  let t = 'RIGHT';
  console.log('y_magnitude', y_magnitude , this.start_y, this.stop_y)
  if (y_magnitude > 0.66) {
    ((this.start_y - this.stop_y) < 0) ? t += 'DOWN' : t += 'UP'
  }
  return t
})() : (() => {
  let t = 'LEFT';
  console.log('y_magnitude', y_magnitude , this.start_y, this.stop_y)
  if (y_magnitude > 0.66) {
    ((this.start_y - this.stop_y) < 0) ? t += 'DOWN' : t += 'UP'
  }
  return t
})() ;