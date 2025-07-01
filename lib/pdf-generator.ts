import jsPDF from "jspdf"

export interface PDFData {
  educator: {
    id: string
    name: string
    specialization: string
    joinDate: string
    committedHours: number
    completedHours: number
  }
  videos: Array<{
    id: string
    title: string
    duration: string
    views: string
    engagement: number
    uploadDate: string
    addedDate: string
    likes?: number
    comments?: number
  }>
  analytics: {
    totalYouTubeHours: number
    totalVideos: number
    averageEngagement: number
    totalViews: number
    weeklyProgress?: Array<{
      week: string
      hours: number
      videos: number
      engagement: number
    }>
  }
}

// Helper function to format numbers
const formatNumber = (num: string | number): string => {
  const number = typeof num === "string" ? Number.parseInt(num.replace(/,/g, "")) : num
  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`
  } else if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`
  }
  return number.toString()
}

// Helper function to format hours
const formatHours = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return `${hours}h ${mins}m`
}

// Helper function to convert duration to minutes
const durationToMinutes = (duration: string): number => {
  const parts = duration.split(":")
  if (parts.length === 2) {
    return Number.parseInt(parts[0]) + Number.parseInt(parts[1]) / 60
  } else if (parts.length === 3) {
    return Number.parseInt(parts[0]) * 60 + Number.parseInt(parts[1]) + Number.parseInt(parts[2]) / 60
  }
  return 0
}

// Create and return a drawn chart canvas
const createChart = (type: "bar" | "line" | "doughnut", data: any, options: any): Promise<HTMLCanvasElement> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    canvas.width = 400
    canvas.height = 300
    const ctx = canvas.getContext("2d")!

    // Simple chart drawing logic
    if (type === "bar") {
      drawBarChart(ctx, data, canvas.width, canvas.height)
    } else if (type === "line") {
      drawLineChart(ctx, data, canvas.width, canvas.height)
    } else if (type === "doughnut") {
      drawDoughnutChart(ctx, data, canvas.width, canvas.height)
    }

    resolve(canvas)
  })
}

// Simple bar chart drawing
const drawBarChart = (ctx: CanvasRenderingContext2D, data: any, width: number, height: number) => {
  const padding = 40
  const chartWidth = width - 2 * padding
  const chartHeight = height - 2 * padding

  // Clear canvas
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, width, height)

  // Draw background
  ctx.fillStyle = "#f8fafc"
  ctx.fillRect(padding, padding, chartWidth, chartHeight)

  // Draw bars
  const barWidth = chartWidth / data.labels.length
  const maxValue = Math.max(...data.datasets[0].data)

  data.datasets[0].data.forEach((value: number, index: number) => {
    const barHeight = (value / maxValue) * chartHeight
    const x = padding + index * barWidth + barWidth * 0.1
    const y = padding + chartHeight - barHeight

    // Draw bar
    ctx.fillStyle = "#8b5cf6"
    ctx.fillRect(x, y, barWidth * 0.8, barHeight)

    // Draw value label
    ctx.fillStyle = "#374151"
    ctx.font = "12px Arial"
    ctx.textAlign = "center"
    ctx.fillText(value.toString(), x + barWidth * 0.4, y - 5)

    // Draw x-axis label
    ctx.fillText(data.labels[index], x + barWidth * 0.4, height - 10)
  })

  // Draw title
  ctx.fillStyle = "#1f2937"
  ctx.font = "bold 16px Arial"
  ctx.textAlign = "center"
  ctx.fillText(data.title || "Chart", width / 2, 25)
}

// Simple line chart drawing
const drawLineChart = (ctx: CanvasRenderingContext2D, data: any, width: number, height: number) => {
  const padding = 40
  const chartWidth = width - 2 * padding
  const chartHeight = height - 2 * padding

  // Clear canvas
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, width, height)

  // Draw background
  ctx.fillStyle = "#f8fafc"
  ctx.fillRect(padding, padding, chartWidth, chartHeight)

  // Draw line
  const maxValue = Math.max(...data.datasets[0].data)
  const minValue = Math.min(...data.datasets[0].data)
  const valueRange = maxValue - minValue || 1

  ctx.strokeStyle = "#10b981"
  ctx.lineWidth = 3
  ctx.beginPath()

  data.datasets[0].data.forEach((value: number, index: number) => {
    const x = padding + (index / (data.labels.length - 1)) * chartWidth
    const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight

    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }

    // Draw point
    ctx.fillStyle = "#10b981"
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, 2 * Math.PI)
    ctx.fill()

    // Draw value label
    ctx.fillStyle = "#374151"
    ctx.font = "10px Arial"
    ctx.textAlign = "center"
    ctx.fillText(value.toString(), x, y - 10)

    // Draw x-axis label
    ctx.fillText(data.labels[index], x, height - 10)
  })

  ctx.stroke()

  // Draw title
  ctx.fillStyle = "#1f2937"
  ctx.font = "bold 16px Arial"
  ctx.textAlign = "center"
  ctx.fillText(data.title || "Chart", width / 2, 25)
}

// Simple doughnut chart drawing
const drawDoughnutChart = (ctx: CanvasRenderingContext2D, data: any, width: number, height: number) => {
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) / 3
  const innerRadius = radius * 0.6

  // Clear canvas
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, width, height)

  const total = data.datasets[0].data.reduce((sum: number, value: number) => sum + value, 0)
  let currentAngle = -Math.PI / 2

  const colors = ["#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"]

  data.datasets[0].data.forEach((value: number, index: number) => {
    const sliceAngle = (value / total) * 2 * Math.PI

    // Draw slice
    ctx.fillStyle = colors[index % colors.length]
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
    ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true)
    ctx.closePath()
    ctx.fill()

    // Draw label
    const labelAngle = currentAngle + sliceAngle / 2
    const labelX = centerX + Math.cos(labelAngle) * (radius + 20)
    const labelY = centerY + Math.sin(labelAngle) * (radius + 20)

    ctx.fillStyle = "#374151"
    ctx.font = "12px Arial"
    ctx.textAlign = "center"
    ctx.fillText(`${data.labels[index]}: ${value}`, labelX, labelY)

    currentAngle += sliceAngle
  })

  // Draw title
  ctx.fillStyle = "#1f2937"
  ctx.font = "bold 16px Arial"
  ctx.textAlign = "center"
  ctx.fillText(data.title || "Chart", width / 2, 25)
}

export const generateEducatorPDF = async (data: PDFData): Promise<void> => {
  const pdf = new jsPDF("p", "mm", "a4")
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  let yPosition = 20

  // Helper function to add new page if needed
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - 20) {
      pdf.addPage()
      yPosition = 20
    }
  }

  // Helper function to add text with word wrap
  const addText = (text: string, x: number, y: number, maxWidth: number, fontSize = 10) => {
    pdf.setFontSize(fontSize)
    const lines = pdf.splitTextToSize(text, maxWidth)
    pdf.text(lines, x, y)
    return lines.length * (fontSize * 0.35) // Return height used
  }

  // Add Unacademy header
  pdf.setFillColor(16, 185, 129) // Green color
  pdf.rect(0, 0, pageWidth, 15, "F")
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(16)
  pdf.setFont("helvetica", "bold")
  pdf.text("UNACADEMY - YouTube Analytics Report", pageWidth / 2, 10, { align: "center" })

  yPosition = 25

  // Educator Information Section
  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(18)
  pdf.setFont("helvetica", "bold")
  pdf.text("Educator Performance Report", 20, yPosition)
  yPosition += 10

  // Educator details box
  pdf.setFillColor(248, 250, 252)
  pdf.rect(20, yPosition, pageWidth - 40, 35, "F")
  pdf.setDrawColor(226, 232, 240)
  pdf.rect(20, yPosition, pageWidth - 40, 35, "S")

  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.text(`${data.educator.name}`, 25, yPosition + 8)

  pdf.setFontSize(10)
  pdf.setFont("helvetica", "normal")
  pdf.text(`Educator ID: ${data.educator.id}`, 25, yPosition + 15)
  pdf.text(`Specialization: ${data.educator.specialization}`, 25, yPosition + 22)
  pdf.text(`Join Date: ${data.educator.joinDate}`, 25, yPosition + 29)

  // Progress bar for committed vs completed hours
  const progressWidth = 60
  const progressHeight = 4
  const progressX = pageWidth - 85
  const progressY = yPosition + 20

  pdf.setFillColor(226, 232, 240)
  pdf.rect(progressX, progressY, progressWidth, progressHeight, "F")

  const completionPercentage = (data.educator.completedHours / data.educator.committedHours) * 100
  const filledWidth = (completionPercentage / 100) * progressWidth

  pdf.setFillColor(16, 185, 129)
  pdf.rect(progressX, progressY, filledWidth, progressHeight, "F")

  pdf.setFontSize(8)
  pdf.text(`${Math.round(completionPercentage)}% Complete`, progressX, progressY - 2)
  pdf.text(`${data.educator.completedHours}h / ${data.educator.committedHours}h`, progressX, progressY + 10)

  yPosition += 45

  // Key Metrics Section
  checkPageBreak(40)
  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.text("Key Performance Metrics", 20, yPosition)
  yPosition += 10

  // Metrics cards
  const cardWidth = (pageWidth - 60) / 4
  const cardHeight = 25
  const metrics = [
    { label: "Total Hours", value: formatHours(data.analytics.totalYouTubeHours), color: [139, 92, 246] },
    { label: "Videos", value: data.analytics.totalVideos.toString(), color: [16, 185, 129] },
    { label: "Avg Engagement", value: `${data.analytics.averageEngagement}%`, color: [245, 158, 11] },
    { label: "Total Views", value: formatNumber(data.analytics.totalViews), color: [239, 68, 68] },
  ]

  metrics.forEach((metric, index) => {
    const x = 20 + index * (cardWidth + 5)

    // Card background
    pdf.setFillColor(metric.color[0], metric.color[1], metric.color[2])
    pdf.rect(x, yPosition, cardWidth, cardHeight, "F")

    // Card content
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(16)
    pdf.setFont("helvetica", "bold")
    pdf.text(metric.value, x + cardWidth / 2, yPosition + 10, { align: "center" })

    pdf.setFontSize(8)
    pdf.setFont("helvetica", "normal")
    pdf.text(metric.label, x + cardWidth / 2, yPosition + 18, { align: "center" })
  })

  yPosition += 35

  // Charts Section
  if (data.analytics.weeklyProgress && data.analytics.weeklyProgress.length > 0) {
    checkPageBreak(80)
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.text("Weekly Progress Analysis", 20, yPosition)
    yPosition += 10

    // Create and add bar chart for weekly hours
    const barChartData = {
      labels: data.analytics.weeklyProgress.map((w) => w.week),
      datasets: [
        {
          data: data.analytics.weeklyProgress.map((w) => w.hours),
        },
      ],
      title: "Weekly Hours Progress",
    }

    const barChart = await createChart("bar", barChartData, {})
    const barChartImg = barChart.toDataURL("image/png")

    pdf.addImage(barChartImg, "PNG", 20, yPosition, 80, 60)

    // Create and add line chart for engagement
    const lineChartData = {
      labels: data.analytics.weeklyProgress.map((w) => w.week),
      datasets: [
        {
          data: data.analytics.weeklyProgress.map((w) => w.engagement),
        },
      ],
      title: "Weekly Engagement Trend",
    }

    const lineChart = await createChart("line", lineChartData, {})
    const lineChartImg = lineChart.toDataURL("image/png")

    pdf.addImage(lineChartImg, "PNG", 110, yPosition, 80, 60)

    yPosition += 70
  }

  // Video Performance Section
  checkPageBreak(20)
  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.text("Video Performance Summary", 20, yPosition)
  yPosition += 10

  // Top performing videos
  const topVideos = [...data.videos].sort((a, b) => b.engagement - a.engagement).slice(0, 5)

  if (topVideos.length > 0) {
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")
    pdf.text("Top 5 Performing Videos", 20, yPosition)
    yPosition += 8

    // Table header
    pdf.setFillColor(248, 250, 252)
    pdf.rect(20, yPosition, pageWidth - 40, 8, "F")
    pdf.setFontSize(8)
    pdf.setFont("helvetica", "bold")
    pdf.text("Title", 25, yPosition + 5)
    pdf.text("Duration", 120, yPosition + 5)
    pdf.text("Views", 140, yPosition + 5)
    pdf.text("Engagement", 160, yPosition + 5)
    yPosition += 8

    topVideos.forEach((video, index) => {
      checkPageBreak(6)
      pdf.setFont("helvetica", "normal")

      // Alternate row colors
      if (index % 2 === 0) {
        pdf.setFillColor(252, 252, 252)
        pdf.rect(20, yPosition, pageWidth - 40, 6, "F")
      }

      const titleHeight = addText(video.title.substring(0, 50) + "...", 25, yPosition + 4, 90, 8)
      pdf.text(video.duration, 120, yPosition + 4)
      pdf.text(video.views, 140, yPosition + 4)
      pdf.text(`${video.engagement}%`, 160, yPosition + 4)

      yPosition += 6
    })
  }

  yPosition += 10

  // Engagement Distribution Chart
  if (data.videos.length > 0) {
    checkPageBreak(80)
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")
    pdf.text("Engagement Distribution", 20, yPosition)
    yPosition += 10

    // Categorize videos by engagement
    const highEngagement = data.videos.filter((v) => v.engagement >= 90).length
    const mediumEngagement = data.videos.filter((v) => v.engagement >= 70 && v.engagement < 90).length
    const lowEngagement = data.videos.filter((v) => v.engagement < 70).length

    const doughnutData = {
      labels: ["High (90%+)", "Medium (70-89%)", "Low (<70%)"],
      datasets: [
        {
          data: [highEngagement, mediumEngagement, lowEngagement],
        },
      ],
      title: "Video Engagement Distribution",
    }

    const doughnutChart = await createChart("doughnut", doughnutData, {})
    const doughnutImg = doughnutChart.toDataURL("image/png")

    pdf.addImage(doughnutImg, "PNG", 20, yPosition, 80, 60)

    // Add insights text
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")
    const insights = [
      `• ${highEngagement} videos with high engagement (90%+)`,
      `• ${mediumEngagement} videos with medium engagement (70-89%)`,
      `• ${lowEngagement} videos with low engagement (<70%)`,
      "",
      "Recommendations:",
      "• Focus on content similar to high-engagement videos",
      "• Analyze low-performing videos for improvement opportunities",
      "• Maintain consistent upload schedule for better engagement",
    ]

    let insightY = yPosition + 10
    insights.forEach((insight) => {
      pdf.text(insight, 110, insightY)
      insightY += 5
    })

    yPosition += 70
  }

  // Footer
  pdf.setFontSize(8)
  pdf.setTextColor(100, 100, 100)
  pdf.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, pageHeight - 10)
  pdf.text("Unacademy YouTube Analytics Hub", pageWidth - 20, pageHeight - 10, { align: "right" })

  // Save the PDF
  pdf.save(`${data.educator.name.replace(/\s+/g, "_")}_YouTube_Analytics_Report.pdf`)
}
