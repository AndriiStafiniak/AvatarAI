import React from 'react'
import { Html } from '@react-three/drei'
import './LoadingSpinner.css'

export function LoadingSpinner({ progress = 0 }) {
  return (
    <Html center>
      <div className="loading-container">
        <div className="spinner"></div>
        <div className="progress-text">
          {Math.round(progress)}%
        </div>
      </div>
    </Html>
  )
} 