'use client';

import React, { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Search, Edit2, Trash2, Eye, Home, Loader2, X, AlertTriangle } from 'lucide-react';
import type { Property } from '@/lib/database.types';
import { deleteProperty } from './actions';

function formatPrice(price: number, type: string, period?: string | null) {
  const formatted = new Intl.NumberFormat('en-NG').format(price);
  if (type === 'sale') {
    return `₦${formatted}`;
  }
  if (type === 'short_let') {
    return `₦${formatted}/night`;
  }
  // rent
  return `₦${formatted}/${period === 'month' ? 'mo' : 'yr'}`;
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-700';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'draft':
      return 'bg-slate-100 text-slate-700';
    case 'sold':
    case 'leased':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

interface MyListingsClientProps {
  initialListings: Property[];
  initialError?: string | null;
}

export default function MyListingsClient({
  initialListings,
  initialError = null,
}: MyListingsClientProps) {
  const [listings, setListings] = useState<Property[]>(initialListings);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; property: Property | null }>({
    open: false,
    property: null,
  });
  const [isPending, startTransition] = useTransition();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  const closeDeleteModal = useCallback(() => {
    if (isPending) return;
    setDeleteModal({ open: false, property: null });
  }, [isPending]);

  const getModalFocusables = useCallback(() => {
    if (!modalRef.current) return [];
    return Array.from(
      modalRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true');
  }, []);

  useEffect(() => {
    if (!deleteModal.open) return;

    previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;

    const focusables = getModalFocusables();
    const firstFocusable = focusables[0] ?? modalRef.current;
    if (firstFocusable) {
      firstFocusable.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || isPending) return;
      event.preventDefault();
      closeDeleteModal();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedElementRef.current?.focus();
    };
  }, [closeDeleteModal, deleteModal.open, getModalFocusables, isPending]);

  const handleModalKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;

    const focusables = getModalFocusables();
    if (focusables.length === 0) {
      event.preventDefault();
      modalRef.current?.focus();
      return;
    }

    const firstFocusable = focusables[0];
    const lastFocusable = focusables[focusables.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey && activeElement === firstFocusable) {
      event.preventDefault();
      lastFocusable.focus();
    } else if (!event.shiftKey && activeElement === lastFocusable) {
      event.preventDefault();
      firstFocusable.focus();
    }
  };

  // Filter listings based on search and status
  const filteredListings = listings.filter((property) => {
    const normalizedQuery = searchQuery.toLowerCase();
    const title = property.title?.toLowerCase() ?? '';
    const address = property.address?.toLowerCase() ?? '';
    const city = property.city?.toLowerCase() ?? '';
    const matchesSearch =
      searchQuery === '' ||
      title.includes(normalizedQuery) ||
      address.includes(normalizedQuery) ||
      city.includes(normalizedQuery);

    const matchesStatus =
      statusFilter === 'all' || property.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async () => {
    if (!deleteModal.property) return;

    startTransition(async () => {
      const result = await deleteProperty(deleteModal.property!.id);
      if (result.success) {
        setListings((prev) => prev.filter((p) => p.id !== deleteModal.property!.id));
        setDeleteModal({ open: false, property: null });
      } else {
        alert(result.error || 'Failed to delete property');
      }
    });
  };

  return (
    <div className="space-y-8">
      {initialError && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">
          Unable to load listings: {initialError}
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Listings</h1>
          <p className="text-slate-500">Manage your active properties and draft listings.</p>
        </div>
        <Link
          href="/dashboard/listings/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-5 h-5" />
          Add New Property
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search by title or location"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="draft">Draft</option>
          <option value="sold">Sold</option>
          <option value="leased">Leased</option>
        </select>
      </div>

      {/* Results count */}
      {(searchQuery || statusFilter !== 'all') && (
        <p className="text-sm text-slate-500">
          Showing {filteredListings.length} of {listings.length} listings
        </p>
      )}

      {/* Empty State */}
      {listings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No listings yet</h3>
          <p className="text-slate-500 mb-6">
            You haven&apos;t posted any properties. Get started by creating your first listing.
          </p>
          <Link
            href="/dashboard/listings/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Post Your First Property
          </Link>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No results found</h3>
          <p className="text-slate-500 mb-4">
            Try adjusting your search or filter to find what you&apos;re looking for.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="text-emerald-600 font-semibold hover:text-emerald-700"
          >
            Clear filters
          </button>
        </div>
      ) : (
        /* Table */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Property</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredListings.map((property) => (
                  <tr key={property.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-12 bg-slate-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                          {property.images && property.images[0] ? (
                            <Image
                              src={property.images[0]}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <Home className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{property.title}</div>
                          <div className="text-xs text-slate-500">
                            {property.address}, {property.city}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-slate-600">
                        {property.type.replace('_', '-')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${getStatusBadge(
                          property.status
                        )}`}
                      >
                        {property.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {formatPrice(property.price, property.type, property.period)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/properties/${property.id}`}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/dashboard/listings/${property.id}/edit`}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteModal({ open: true, property })}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && deleteModal.property && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeDeleteModal}
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-description"
            tabIndex={-1}
            onKeyDown={handleModalKeyDown}
            onClick={(event) => event.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 id="delete-modal-title" className="text-lg font-bold text-slate-900">
                  Delete Property
                </h3>
                <p className="text-slate-500 text-sm">This action cannot be undone.</p>
              </div>
            </div>
            <p id="delete-modal-description" className="text-slate-600 mb-6">
              Are you sure you want to delete <strong>{deleteModal.property.title}</strong>? This
              will permanently remove the listing from your account.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeDeleteModal}
                aria-label="Close delete dialog"
                className="px-4 py-2 text-slate-600 font-medium hover:text-slate-800 transition-colors"
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Property'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
