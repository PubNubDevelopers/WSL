import React from 'react'

interface BudgetDisplayProps {
  currentSalary: number
  salaryBudget: number
  selectedSurfersCount: number
}

export default function BudgetDisplay({ currentSalary, salaryBudget, selectedSurfersCount }: BudgetDisplayProps) {
  const remainingBudget = salaryBudget - currentSalary
  const budgetPercentage = (currentSalary / salaryBudget) * 100

  return (
    <div className='bg-gradient-to-r from-wsl-blue-50 to-white border border-wsl-blue-200 rounded-lg p-2 mb-2 shadow-sm'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='text-center'>
            <div className='text-sm font-bold text-wsl-primary'>{selectedSurfersCount}/6</div>
            <div className='text-xs text-wsl-blue-600'>Surfers</div>
          </div>
          <div className='text-center'>
            <div className='text-sm font-bold text-wsl-dark'>
              ${(currentSalary / 1000).toFixed(0)}K
            </div>
            <div className='text-xs text-wsl-blue-600'>Used</div>
          </div>
          <div className='text-center'>
            <div className='text-sm font-bold text-wsl-success'>
              ${(remainingBudget / 1000).toFixed(0)}K
            </div>
            <div className='text-xs text-wsl-blue-600'>Left</div>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-16 bg-wsl-blue-200 rounded-full h-1.5'>
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                budgetPercentage > 90 
                  ? 'bg-red-500' 
                  : budgetPercentage > 75 
                  ? 'bg-yellow-500' 
                  : 'bg-wsl-primary'
              }`}
              style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
            ></div>
          </div>
          <div className='text-xs text-wsl-blue-600 min-w-[30px]'>
            {budgetPercentage.toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  )
}
