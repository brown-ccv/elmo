import React, { useState, useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import { Chip, Interval } from '@/types'

interface DataPoint {
    time: string;
    allocated: number;
    total: number;
}

// Default dates outside component to prevent recreation
const DEFAULT_END_DATE = new Date();
const DEFAULT_START_DATE = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

interface TimeSeriesPlotProps {
    chip: Chip;
    startDate?: Date;
    endDate?: Date;
    interval?: Interval;
    lineColor?: string;
}

function TimeSeriesPlot({
    chip,
    startDate = DEFAULT_START_DATE,
    endDate = DEFAULT_END_DATE,
    interval = Interval.QuarterHour,
    lineColor = "steelblue"
}: TimeSeriesPlotProps) {
    const [data, setData] = useState<DataPoint[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Memoize the dates to prevent unnecessary re-renders
    const memoizedStartDate = useMemo(() => startDate, [startDate.getTime()]);
    const memoizedEndDate = useMemo(() => endDate, [endDate.getTime()]);
    const chipStr = chip === Chip.Cpu ? 'cpu' : 'gpu';

    const drawPlot = () => {
        if (!svgRef.current || !data || !tooltipRef.current || !containerRef.current) return;

        // Clear previous content
        d3.select(svgRef.current).selectAll("*").remove();

        const width = Math.max(1200, containerRef.current.clientWidth);
        const height = width * (9 / 16);
        const margin = { top: 40, right: 40, bottom: 40, left: 60 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // Create scales
        const x = d3.scaleTime()
            .domain(d3.extent(data, (d: DataPoint) => new Date(d.time)) as [Date, Date])
            .range([0, innerWidth]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, (d: DataPoint) => d.total) || 0])
            .range([innerHeight, 0]);

        // Create the SVG container
        const svg = d3.select(svgRef.current);
        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Add X axis
        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x));

        // Add Y axis
        g.append("g")
            .call(d3.axisLeft(y));

        // Add the line
        const line = d3.line<DataPoint>()
            .x((d: DataPoint) => x(new Date(d.time)))
            .y((d: DataPoint) => y(d.allocated));

        // Add the line with hover effect
        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", lineColor)
            .attr("stroke-width", 2)
            .attr("d", line)
            .style("cursor", "pointer")
            .on("mouseover", function () {
                d3.select(tooltipRef.current)
                    .style("opacity", 1);
            })
            .on("mousemove", function (event: MouseEvent) {
                const [mouseX, mouseY] = d3.pointer(event);
                const xDate = x.invert(mouseX);
                const bisect = d3.bisector((d: DataPoint) => new Date(d.time)).left;
                const index = bisect(data, xDate);
                const d = data[index];

                const tooltip = d3.select(tooltipRef.current);
                const tooltipHeight = 80;
                const tooltipWidth = 150;
                const padding = 10;

                // Calculate position relative to SVG
                let top = mouseY + margin.top;
                let left = mouseX + margin.left;

                // If tooltip would go off the bottom of the SVG, show it above the pointer
                if (top + tooltipHeight + padding > innerHeight) {
                    top = mouseY - tooltipHeight - padding + margin.top;
                }

                // If tooltip would go off the right of the SVG, shift it left
                if (left + tooltipWidth + padding > innerWidth) {
                    left = mouseX - tooltipWidth - padding + margin.left;
                }

                tooltip
                    .html(`Time: ${new Date(d.time).toLocaleString()}<br/>
                          Allocated: ${d.allocated} ${chipStr.toUpperCase()}s<br/>
                          Total: ${d.total} ${chipStr.toUpperCase()}s`)
                    .style("left", `${left}px`)
                    .style("top", `${top}px`);
            })
            .on("mouseout", function () {
                d3.select(tooltipRef.current)
                    .style("opacity", 0);
            });
    };

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current && svgRef.current) {
                const width = Math.max(1200, containerRef.current.clientWidth);
                const height = width * (9 / 16);

                // Set SVG dimensions
                const svg = d3.select(svgRef.current);
                svg
                    .attr("width", width)
                    .attr("height", height)
                    .attr("viewBox", [0, 0, width, height]);

                // Only redraw if we have data
                if (data) {
                    drawPlot();
                }
            }
        };

        // Initial size
        handleResize();

        // Add resize listener
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, [data]); // Remove data dependency

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {

                const intervalPath = interval === Interval.Hour ? '/hourly' :
                    interval === Interval.Day ? '/daily' : '';
                const url = `http://localhost:3000/${chipStr}${intervalPath}?start=${memoizedStartDate.toISOString()}&end=${memoizedEndDate.toISOString()}`;
                console.log('Starting fetch...', url);
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

                // Log the raw response
                const rawText = await response.text();
                console.log('Raw response:', rawText);

                // Try to parse the JSON
                let result;
                try {
                    result = JSON.parse(rawText);
                    console.log('Successfully parsed JSON:', result);
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    throw new Error(`Invalid JSON response: ${rawText.substring(0, 100)}...`);
                }

                // Only update state if component is still mounted
                if (isMounted) {
                    setData(result);
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

        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, [chip, memoizedStartDate, memoizedEndDate, interval]);

    // Draw plot when data changes
    useEffect(() => {
        if (data && svgRef.current) {
            console.log('Drawing plot with data:', data);
            drawPlot();
        }
    }, [data]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!data) return <div>No data available</div>;

    return (
        <div
            ref={containerRef}
            className="time-series-plot"
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                minHeight: '675px',
                overflow: 'hidden' // Add this to prevent scrollbars
            }}
        >
            <div
                ref={tooltipRef}
                className="tooltip"
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
                    transition: 'opacity 0.2s',
                    zIndex: 1000,
                    color: '#213547'
                }}
            />
            <svg
                ref={svgRef}
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'block' // Add this to prevent extra spacing
                }}
            />
        </div>
    );
}

export default TimeSeriesPlot;