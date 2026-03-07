import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronUp, Check, Search, AlertCircle } from 'lucide-react'

const Select = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Select an option...",
  disabled = false,
  error = '',
  required = false,
  searchable = false,
  multi = false,
  className = '',
  icon: Icon,
  size = 'md',
  variant = 'default'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const selectRef = useRef(null)
  const searchInputRef = useRef(null)
  const optionRefs = useRef([])

  // Filter options based on search term
  const filteredOptions = searchable 
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !option.hidden
      )
    : options.filter(option => !option.hidden)

  // Get selected options for multi-select
  const selectedValues = multi 
    ? (Array.isArray(value) ? value : [])
    : []

  // Get display value for single select
  const selectedOption = !multi 
    ? options.find(option => option.value === value)
    : null

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when dropdown opens and is searchable
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen, searchable])

  // Reset highlighted index when options change
  useEffect(() => {
    setHighlightedIndex(-1)
  }, [filteredOptions.length])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return

      switch (event.key) {
        case 'Escape':
          setIsOpen(false)
          setSearchTerm('')
          setHighlightedIndex(-1)
          break

        case 'ArrowDown':
          event.preventDefault()
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          )
          break

        case 'ArrowUp':
          event.preventDefault()
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          )
          break

        case 'Enter':
          event.preventDefault()
          if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            handleOptionSelect(filteredOptions[highlightedIndex])
          }
          break

        case 'Tab':
          setIsOpen(false)
          setSearchTerm('')
          setHighlightedIndex(-1)
          break
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, highlightedIndex, filteredOptions])

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      })
    }
  }, [highlightedIndex])

  const handleToggle = () => {
    if (disabled) return
    setIsOpen(!isOpen)
    setSearchTerm('')
    setHighlightedIndex(-1)
  }

  const handleOptionSelect = (option) => {
    if (option.disabled) return

    if (multi) {
      const newValue = selectedValues.includes(option.value)
        ? selectedValues.filter(v => v !== option.value)
        : [...selectedValues, option.value]
      onChange?.(newValue)
    } else {
      onChange?.(option.value)
      setIsOpen(false)
      setSearchTerm('')
    }
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
    setHighlightedIndex(-1)
  }

  const clearSelection = (event) => {
    event.stopPropagation()
    if (multi) {
      onChange?.([])
    } else {
      onChange?.('')
    }
  }

  const removeOption = (valueToRemove, event) => {
    event.stopPropagation()
    if (multi) {
      const newValue = selectedValues.filter(v => v !== valueToRemove)
      onChange?.(newValue)
    }
  }

  const isOptionSelected = (optionValue) => {
    return multi 
      ? selectedValues.includes(optionValue)
      : value === optionValue
  }

  const getDisplayText = () => {
    if (multi) {
      if (selectedValues.length === 0) return placeholder
      if (selectedValues.length === 1) {
        const option = options.find(opt => opt.value === selectedValues[0])
        return option?.label || selectedValues[0]
      }
      return `${selectedValues.length} selected`
    }
    return selectedOption?.label || placeholder
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm'
      case 'lg':
        return 'px-4 py-3 text-base'
      default:
        return 'px-4 py-2.5 text-sm'
    }
  }

  const getVariantClasses = () => {
    const baseClasses = 'w-full text-left border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1'
    
    if (disabled) {
      return `${baseClasses} bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed`
    }

    if (error) {
      return `${baseClasses} bg-white dark:bg-gray-800 border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500 text-gray-900 dark:text-white`
    }

    switch (variant) {
      case 'outline':
        return `${baseClasses} bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500`
      case 'filled':
        return `${baseClasses} bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600`
      default:
        return `${baseClasses} bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500`
    }
  }

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {/* Label */}
      {label && (
        <label className={`block text-sm font-medium mb-2 ${
          error 
            ? 'text-red-600 dark:text-red-400' 
            : 'text-gray-700 dark:text-gray-300'
        }`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Select Trigger */}
      <div
        className={`${getVariantClasses()} ${getSizeClasses()} ${
          isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''
        } flex items-center justify-between cursor-pointer`}
        onClick={handleToggle}
      >
        <div className="flex items-center flex-1 min-w-0">
          {/* Icon */}
          {Icon && (
            <Icon className={`h-4 w-4 mr-2 ${
              error ? 'text-red-500' : 'text-gray-400'
            }`} />
          )}

          {/* Selected Value Display */}
          <div className="flex-1 truncate">
            {multi && selectedValues.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedValues.slice(0, 2).map(value => {
                  const option = options.find(opt => opt.value === value)
                  return (
                    <span
                      key={value}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                    >
                      {option?.label || value}
                      <button
                        type="button"
                        onClick={(e) => removeOption(value, e)}
                        className="ml-1 hover:text-blue-600 dark:hover:text-blue-200"
                      >
                        ×
                      </button>
                    </span>
                  )
                })}
                {selectedValues.length > 2 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                    +{selectedValues.length - 2} more
                  </span>
                )}
              </div>
            ) : (
              <span className={selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
                {getDisplayText()}
              </span>
            )}
          </div>
        </div>

        {/* Clear Button */}
        {(value && !disabled && !multi) && (
          <button
            type="button"
            onClick={clearSelection}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded mr-1"
          >
            ×
          </button>
        )}

        {/* Dropdown Icon */}
        <div className="flex items-center space-x-1">
          {!disabled && (
            <div className="text-gray-400">
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center mt-1.5 space-x-1 text-red-600 dark:text-red-400">
          <AlertCircle size={14} />
          <span className="text-xs">{error}</span>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto animate-fade-in">
          {/* Search Input */}
          {searchable && (
            <div className="p-2 border-b border-gray-200 dark:border-gray-600">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search options..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                {searchTerm ? 'No options found' : 'No options available'}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = isOptionSelected(option.value)
                const isHighlighted = index === highlightedIndex

                return (
                  <div
                    key={option.value}
                    ref={el => optionRefs.current[index] = el}
                    className={`px-4 py-2 text-sm cursor-pointer transition-colors duration-150 ${
                      option.disabled
                        ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
                        : `${
                            isHighlighted
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                              : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`
                    } ${
                      isSelected && !option.disabled
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 font-medium'
                        : ''
                    }`}
                    onClick={() => handleOptionSelect(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{option.label}</span>
                      
                      {/* Selection Indicator */}
                      {isSelected && !option.disabled && (
                        <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2" />
                      )}
                    </div>

                    {/* Option Description */}
                    {option.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {option.description}
                      </p>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Selected Count for Multi-select */}
          {multi && selectedValues.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {selectedValues.length} option{selectedValues.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

Select.propTypes = {
  // ... (optional prop types)
}

export default Select