import { useState } from 'react'
import './App.css'
import TimeSeriesPlot from '@/components/TimeSeriesPlot'
import Footer from '@/components/Footer'
import { Chip } from '@/types'
import CalendarHeatmap from '@/components/CalendarHeatmap'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <CalendarHeatmap chip={Chip.Cpu} />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <CalendarHeatmap chip={Chip.Gpu} />
      </div>

      <TimeSeriesPlot chip={Chip.Cpu} lineColor="#1f77b4" />

      <TimeSeriesPlot chip={Chip.Gpu} lineColor="#9467bd" />

      <Footer />
    </>
  )
}

export default App
