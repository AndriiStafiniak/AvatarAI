import React from 'react'
import './LoadingSpinner.css'

export function LoadingSpinner({ progress }) {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <div className="progress-text">{progress}%</div>
    </div>
  )
} 