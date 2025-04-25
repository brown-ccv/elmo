import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { Chip, Interval } from '@/types';

interface DayData {
  date: string;
  value: number;
}

interface CalendarHeatmapProps {
  chip: Chip;
  startDate?: Date;
  lineColor?: string;
}

function CalendarHeatmap({
  chip,
  startDate: propStartDate,
  lineColor = "steelblue"
}: CalendarHeatmapProps) {
  const [data, setData] = useState<DayData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const chipStr = chip === Chip.Cpu ? 'cpu' : 'gpu';

  // Calculate start date - use provided date or default to current year's start
  const startDate = useMemo(() => {
    if (propStartDate) return new Date(propStartDate);
    return new Date(new Date().getFullYear(), 0, 1);
  }, [propStartDate]);

  // Calculate end date - exactly 1 year (minus 1 day) from start date
  const endDate = useMemo(() => {
    const end = new Date(startDate);
    end.setFullYear(end.getFullYear() + 1);
    end.setDate(end.getDate() - 1);
    return end;
  }, [startDate]);

  // Title text based on date range
  const titleText = useMemo(() => {
    return `${chipStr.toUpperCase()} Usage`;
  }, [chipStr]);

  // Generate all dates in the range to ensure complete calendar
  const allDatesInRange = useMemo(() => {
    const dates = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }, [startDate, endDate]);

  const drawHeatmap = () => {
    if (!svgRef.current || !data || !tooltipRef.current || !containerRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    // Set SVG dimensions based on container
    const containerWidth = containerRef.current.clientWidth;
    const svg = d3.select(svgRef.current)
      .attr("width", containerWidth)
      .attr("height", Math.max(7 * (12 + 2) * 2, 230)); // Ensure minimum height

    const cellSize = 12;
    const cellMargin = 2;
    const fullCellSize = cellSize + cellMargin;

    const cellColor = chip === Chip.Cpu ? "#1f77b4" : "#9467bd";

    // Get the first Sunday before or on the start date (for week alignment)
    const firstSunday = new Date(startDate);
    while (firstSunday.getDay() !== 0) {
      firstSunday.setDate(firstSunday.getDate() - 1);
    }

    // Calculate number of weeks based on the adjusted start date
    const totalDays = Math.ceil((endDate.getTime() - firstSunday.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    const weeksNeeded = Math.ceil(totalDays / 7);

    // Fixed width based on weeks needed - no auto-adjustment
    const calendarWidth = Math.min(weeksNeeded * fullCellSize, containerWidth - 100); // Allow margins

    // Margins with extra right margin for legend
    const margin = { top: 50, right: 60, bottom: 20, left: 40 };

    // Fixed dimensions that don't depend on container width
    const width = calendarWidth + margin.left + margin.right;
    const height = Math.max(7 * fullCellSize + 50, 230); // min height for legend

    // Update SVG viewBox for proper scaling
    svg.attr("viewBox", [0, 0, width, height]);

    // Add a background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#f9f9f9")
      .attr("rx", 8);

    // Get min/max values for color scale from available data
    const minValue = d3.min(data, d => d.value) || 0;
    const maxValue = d3.max(data, d => d.value) || 0;

    // Map API data to date strings for lookup
    const dataMap = new Map(data.map(d => [d.date.split('T')[0], d.value]));

    // Color scale
    const colorScale = d3.scaleSequential()
      .domain([minValue, maxValue])
      .interpolator(d3.interpolateBlues);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Create month labels - calculate all months in the 1-year period
    const firstMonthStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const lastMonthEnd = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
    const months = d3.timeMonths(firstMonthStart, new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth() + 1, 1));

    g.selectAll(".month-label")
      .data(months.slice(1)) // Skip the first month
      .enter().append("text")
      .attr("class", "month-label")
      .attr("x", d => {
        // Find the first Sunday on or before the first day of the month
        const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
        const firstSundayOfMonth = new Date(firstDay);
        while (firstSundayOfMonth.getDay() !== 0) {
          firstSundayOfMonth.setDate(firstSundayOfMonth.getDate() - 1);
        }

        // Calculate weeks since the adjusted start date
        const daysSinceStart = Math.floor((firstSundayOfMonth.getTime() - firstSunday.getTime()) / (24 * 60 * 60 * 1000));
        const weeksSinceStart = Math.floor(daysSinceStart / 7);

        return weeksSinceStart * fullCellSize;
      })
      .attr("y", -10)
      .attr("text-anchor", "start")
      .attr("font-size", "10px")
      .text(d => d3.timeFormat("%b %Y")(d));

    // Day of week labels - Sunday is the first day
    const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    g.selectAll(".weekday-label")
      .data(weekdayLabels)
      .enter().append("text")
      .attr("class", "weekday-label")
      .attr("x", -5)
      .attr("y", (d, i) => (i + 0.5) * fullCellSize)
      .attr("text-anchor", "end")
      .attr("font-size", "10px")
      .attr("dominant-baseline", "middle")
      .text(d => d);

    // Function to calculate the week number relative to the first Sunday
    const getWeekNumber = (date: Date) => {
      const daysSinceStart = Math.floor((date.getTime() - firstSunday.getTime()) / (24 * 60 * 60 * 1000));
      return Math.floor(daysSinceStart / 7);
    };

    // Filter to only include dates in the specified range
    const visibleDates = allDatesInRange.filter(d =>
      d >= startDate && d <= endDate
    );

    // Prepare day cells for all dates in the range
    g.selectAll(".day")
      .data(visibleDates)
      .enter().append("rect")
      .attr("class", "day")
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("x", d => getWeekNumber(d) * fullCellSize)
      .attr("y", d => d.getDay() * fullCellSize)
      .attr("rx", 2)
      .attr("ry", 2)
      .attr("fill", d => {
        // Format date as YYYY-MM-DD for lookup
        const dateKey = d.toISOString().split('T')[0];
        // If we have data for this date, color it; otherwise use light gray
        return dataMap.has(dateKey) ? colorScale(dataMap.get(dateKey)!) : "#eee";
      })
      .attr("stroke", "#ccc")
      .attr("stroke-width", 0.5)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(tooltipRef.current)
          .style("opacity", 1);
      })
      .on("mousemove", function (event, d) {
        const formattedDate = d.toLocaleDateString();
        const dateKey = d.toISOString().split('T')[0];
        const value = dataMap.get(dateKey) || 0;

        const tooltip = d3.select(tooltipRef.current);
        const tooltipWidth = 150;
        const tooltipHeight = 60;
        const padding = 10;

        // Calculate tooltip position relative to container
        const [mouseX, mouseY] = d3.pointer(event, containerRef.current);

        // Position tooltip with boundary checks
        let top = mouseY;
        let left = mouseX + padding;

        // Keep tooltip inside container
        if (left + tooltipWidth + padding > containerWidth) {
          left = mouseX - tooltipWidth - padding;
        }

        // Adjust vertical position if needed
        if (top + tooltipHeight + padding > height) {
          top = mouseY - tooltipHeight - padding;
        }

        tooltip
          .html(`
            Date: ${formattedDate}<br>
            ${chipStr.toUpperCase()}s: ${value ? Math.round(value) : "No data"}
          `)
          .style("left", `${left}px`)
          .style("top", `${top}px`);
      })
      .on("mouseout", function () {
        d3.select(tooltipRef.current)
          .style("opacity", 0);
      });

    // Add a legend
    const legendWidth = 15;
    const legendHeight = 7 * fullCellSize; // Match the height of the calendar (7 days)

    const legend = svg.append("g")
      .attr("transform", `translate(${width - legendWidth - margin.right / 2}, ${margin.top})`); // Align with the calendar grid

    // Create gradient for legend
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "heatmap-gradient")
      .attr("x1", "0%")
      .attr("x2", "0%")
      .attr("y1", "100%")
      .attr("y2", "0%");

    // Add color stops to gradient
    const numStops = 10;
    for (let i = 0; i <= numStops; i++) {
      const offset = i / numStops;
      gradient.append("stop")
        .attr("offset", `${offset * 100}%`)
        .attr("stop-color", colorScale(minValue + offset * (maxValue - minValue)));
    }

    // Add the legend rectangle filled with the gradient
    legend.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#heatmap-gradient)");

    // Add legend labels
    legend.append("text")
      .attr("x", -5)
      .attr("y", legendHeight + 5)
      .attr("text-anchor", "end")
      .attr("font-size", "10px")
      .text(Math.round(minValue));

    legend.append("text")
      .attr("x", -5)
      .attr("y", 0)
      .attr("dy", "-0.2em")
      .attr("text-anchor", "end")
      .attr("font-size", "10px")
      .text(Math.round(maxValue));

    // Add a "Legend" label
    legend.append("text")
      .attr("x", legendWidth / 2)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .text("Usage");

    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text(titleText);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Use daily interval for the calendar view
        const url = `http://localhost:3000/${chipStr}/daily?start=${startDate.toISOString()}&end=${endDate.toISOString()}`;
        console.log('Fetching calendar data...', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rawText = await response.text();
        console.log('Raw response:', rawText);

        let rawData;
        try {
          rawData = JSON.parse(rawText);
        } catch (parseError) {
          throw new Error(`Invalid JSON response: ${rawText.substring(0, 100)}...`);
        }

        // Transform the data - calculate the median value for each day
        const processedData = rawData.map((item: any) => ({
          date: item.time,
          value: Math.round(item.allocated), // Round the allocated value to integer
        }));

        if (isMounted) {
          setData(processedData);
          setLoading(false);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'An error occurred');
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [chipStr, startDate, endDate]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && svgRef.current) {
        // Set SVG dimensions based on container
        const width = containerRef.current.clientWidth;

        // Set SVG dimensions
        const svg = d3.select(svgRef.current);
        svg
          .attr("width", width)
          .attr("height", Math.max(7 * (12 + 2) * 2, 230));

        // Only redraw if we have data
        if (data) {
          drawHeatmap();
        }
      }
    };

    // Initial size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [data]);

  // Draw heatmap when data changes
  useEffect(() => {
    if (data) {
      drawHeatmap();
    }
  }, [data]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data available</div>;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '230px',
        overflow: 'hidden'
      }}
    >
      <div
        ref={tooltipRef}
        style={{
          position: 'absolute',
          opacity: 0,
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '8px',
          pointerEvents: 'none',
          fontSize: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 1000,
          color: '#213547'
        }}
      />
      <svg
        ref={svgRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
    </div>
  );
}

export default CalendarHeatmap;
