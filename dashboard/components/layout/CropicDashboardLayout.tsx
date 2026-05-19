'use client'

import { useState, ReactNode } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild } from '@headlessui/react'
import {
  Bars3Icon,
  HomeIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ChartBarIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline'

interface NavigationItem {
  name: string
  href: string
  icon: any
  current: boolean
}

interface DashboardLayoutProps {
  children: ReactNode
  title: string
  currentPage: 'dashboard' | 'images' | 'alerts' | 'analytics' | 'regions'
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function CropicDashboardLayout({ children, title, currentPage }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/', icon: HomeIcon, current: currentPage === 'dashboard' },
    { name: 'Crop Images', href: '/images', icon: PhotoIcon, current: currentPage === 'images' },
    { name: 'Damage Alerts', href: '/alerts', icon: ExclamationTriangleIcon, current: currentPage === 'alerts' },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, current: currentPage === 'analytics' },
    { name: 'Regions', href: '/regions', icon: MapPinIcon, current: currentPage === 'regions' },
  ]

  return (
    <>
      <div>
        {/* Mobile sidebar */}
        <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0"
          />

          <div className="fixed inset-0 flex">
            <DialogPanel
              transition
              className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
            >
              <TransitionChild>
                <div className="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
                  <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon aria-hidden="true" className="size-6 text-white" />
                  </button>
                </div>
              </TransitionChild>

              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-b from-green-900 to-gray-900 px-6 pb-2 ring-1 ring-white/10">
                <div className="flex h-16 shrink-0 items-center">
                  <div className="flex items-center">
                    <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="ml-2">
                      <span className="text-white font-bold text-lg">Krishi Sanrakshan</span>
                      <p className="text-green-300 text-xs">कृषि संरक्षण</p>
                    </div>
                  </div>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="-mx-2 flex-1 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className={classNames(
                            item.current
                              ? 'bg-green-800 text-white'
                              : 'text-gray-300 hover:bg-green-800/50 hover:text-white',
                            'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold transition-colors',
                          )}
                        >
                          <item.icon aria-hidden="true" className="size-6 shrink-0" />
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-20 lg:overflow-y-auto lg:bg-gradient-to-b lg:from-green-900 lg:to-gray-900 lg:pb-4">
          <div className="relative flex h-16 shrink-0 items-center justify-center">
            <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <nav className="relative mt-8">
            <ul role="list" className="flex flex-col items-center space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className={classNames(
                      item.current 
                        ? 'bg-green-800 text-white' 
                        : 'text-gray-400 hover:bg-green-800/50 hover:text-white',
                      'group flex gap-x-3 rounded-md p-3 text-sm/6 font-semibold transition-colors',
                    )}
                    title={item.name}
                  >
                    <item.icon aria-hidden="true" className="size-6 shrink-0" />
                    <span className="sr-only">{item.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-gradient-to-r from-green-900 to-gray-900 px-4 py-4 shadow-xl sm:px-6 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="relative -m-2.5 p-2.5 text-gray-300 lg:hidden"
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
          <div className="relative flex-1 text-sm/6 font-semibold text-white">{title}</div>
        </div>

        {/* Main content */}
        <main className="lg:pl-20">
          {children}
        </main>
      </div>
    </>
  )
}

