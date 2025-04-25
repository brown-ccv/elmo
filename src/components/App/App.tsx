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
      <CalendarHeatmap chip={Chip.Cpu} startDate={new Date('2024-04-01')} />

      <CalendarHeatmap chip={Chip.Gpu} startDate={new Date('2024-04-01')} />

      <TimeSeriesPlot chip={Chip.Cpu} startDate={new Date('2023-01-01')} endDate={new Date('2025-04-01')} lineColor="#1f77b4" />

      <TimeSeriesPlot chip={Chip.Gpu} startDate={new Date('2023-01-01')} endDate={new Date('2025-04-01')} lineColor="#9467bd" />

      <Footer />
    </>
  )
}

export default App
