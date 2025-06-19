import { useCallback, useEffect, useRef, useState } from "react"

import clsx from "clsx"

import SelectArrow from "@assets/icons/select-arrow.svg?react"

import type { ChangeEvent, FC, RefObject } from "react"

import "./style.scss"

export type SelectOption = {
  value: string
  label: string
}

type MenuProps = {
  menuRef: RefObject<HTMLUListElement>
  isMenuOpen: boolean
  searchValue: string
  options: Array<SelectOption>
  onOptionClick: (option?: SelectOption) => void
  selected?: SelectOption
}

type SelectProps = {
  onSelect?: (option?: SelectOption) => void
  options?: Array<SelectOption>
  selected?: SelectOption
  name?: string
  label?: string
  disabled?: boolean
}

const MENU_MAX_HEIGHT = 170

const SelectMenu: FC<MenuProps> = ({ menuRef, isMenuOpen, searchValue, options, onOptionClick, selected }) => {
  const filteredOptions = options.filter(option => option.label.toLowerCase().includes(searchValue.toLowerCase()))

  return (
    <ul
      ref={menuRef}
      className={clsx("webrtc-widget-select__options", "webrtc-widget-select__options--transition", {
        "webrtc-widget-select__options--open": isMenuOpen
      })}
    >
      {filteredOptions.length ? (
        filteredOptions.map((option, index) => (
          // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
          <li
            key={`${option.value}_${index}`}
            className={clsx("webrtc-widget-select__option", {
              "webrtc-widget-select__option--selected": selected?.value === option.value
            })}
            onClick={() => onOptionClick(option)}
          >
            {option.label}
          </li>
        ))
      ) : (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <li className="webrtc-widget-select__option" onClick={() => onOptionClick()}>
          No items found
        </li>
      )}
    </ul>
  )
}

export const Select: FC<SelectProps> = ({ onSelect, options = [], selected, name, label, disabled }) => {
  const selectRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)

  const [isInputFilled, setInputFilled] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [isMenuOpen, setMenuOpen] = useState(false)

  const onArrowClick = () => {
    setMenuOpen(prev => !prev)
  }

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputFilled(!!event.currentTarget.value)
    setSearchValue(event.currentTarget.value)

    if (!event.currentTarget.value) {
      onSelect?.()
    }

    if (!isMenuOpen) {
      setMenuOpen(true)
    }
  }

  const onFocus = () => {
    setMenuOpen(true)
  }

  const onMenuItemClick = (option?: SelectOption) => {
    setMenuOpen(false)

    if (option) {
      onSelect?.(option)
    }
  }

  const onClickOutside = useCallback(
    (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setMenuOpen(false)

        if (inputRef.current) {
          inputRef.current.value = selected?.label || ""
        }

        setInputFilled(!!selected?.label)
        setSearchValue("")
      }
    },
    [selectRef.current, selected]
  )

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = selected?.label || ""
    }

    setInputFilled(!!selected?.label)
    setSearchValue("")
  }, [selected])

  useEffect(() => {
    document.addEventListener("mousedown", onClickOutside)

    return () => {
      document.removeEventListener("mousedown", onClickOutside)
    }
  }, [onClickOutside])

  useEffect(() => {
    if (!menuRef.current) return

    const elem = menuRef.current

    if (isMenuOpen) {
      const { scrollHeight } = elem
      const height = Math.min(scrollHeight, MENU_MAX_HEIGHT)

      elem.style.height = `${height}px`

      return
    }

    if (!isMenuOpen) {
      elem.style.height = "0px"
    }
  }, [menuRef.current, isMenuOpen])

  return (
    <div ref={selectRef} className="webrtc-widget-select">
      {label && (
        <label
          className={clsx("webrtc-widget-select__label", "webrtc-widget-select__label--transition", {
            "webrtc-widget-select__label--filled": isInputFilled,
            "webrtc-widget-select__label--disabled": disabled
          })}
          htmlFor={name}
        >
          {label}
        </label>
      )}

      <div
        className={clsx("webrtc-widget-select__arrow", {
          "webrtc-widget-select__arrow--open": isMenuOpen,
          "webrtc-widget-select__arrow--disabled": disabled
        })}
        onClick={onArrowClick}
      >
        <SelectArrow />
      </div>

      <input
        ref={inputRef}
        className="webrtc-widget-select__input"
        onChange={onChange}
        type="text"
        name={name}
        id={name}
        disabled={disabled}
        onFocus={onFocus}
      />

      <SelectMenu
        menuRef={menuRef}
        isMenuOpen={isMenuOpen}
        searchValue={searchValue}
        options={options}
        selected={selected}
        onOptionClick={onMenuItemClick}
      />
    </div>
  )
}
