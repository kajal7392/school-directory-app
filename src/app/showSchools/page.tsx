'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import Image from 'next/image';

interface School {
  id: number;
  name: string;
  address: string;
  city: string;
  image: string;
}

// Skeleton Loader Component
const SchoolCardSkeleton = () => (
  <div className={styles.skeletonCard}>
    <div className={styles.skeletonImage}></div>
    <div className={styles.skeletonContent}>
      <div className={styles.skeletonLine}></div>
      <div className={styles.skeletonLine}></div>
      <div className={styles.skeletonLine}></div>
    </div>
  </div>
);

export default function ShowSchools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const schoolsPerPage = 6;

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/get-schools?sortBy=${sortBy}`);
        if (!response.ok) throw new Error('Failed to fetch schools');
        
        const data = await response.json();
        setSchools(data.schools || []);
      } catch (error) {
        console.error('Failed to fetch schools:', error);
        setError('Failed to load schools. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchSchools();
  }, [sortBy]);

  // Filter schools based on search and city filter
  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = filterCity === '' || school.city === filterCity;
    return matchesSearch && matchesCity;
  });

  // Pagination
  const currentSchools = filteredSchools.slice(
    (currentPage - 1) * schoolsPerPage,
    currentPage * schoolsPerPage
  );

  const totalPages = Math.ceil(filteredSchools.length / schoolsPerPage);

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <h2>⚠️ Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (schools.length === 0 && !loading) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <h2>🏫 No Schools Found</h2>
          <p>Be the first to add a school to our directory!</p>
          <Link href="/addSchool" className={styles.addSchoolLink}>
            Add Your School
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Our Schools</h1>
      
      {/* Controls Section */}
      <div className={styles.controls}>
        <div className={styles.searchSection}>
          <input
            type="text"
            placeholder="Search by name or city..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); 
            }}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterSection}>
          <select 
            value={filterCity} 
            onChange={(e) => {
              setFilterCity(e.target.value);
              setCurrentPage(1);
            }}
            className={styles.filterSelect}
          >
            <option value="">All Cities</option>
            {[...new Set(schools.map(s => s.city))].map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="name">Sort by Name</option>
            <option value="city">Sort by City</option>
            <option value="created_at">Sort by Newest</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className={styles.resultsInfo}>
        <p>Showing {currentSchools.length} of {filteredSchools.length} schools</p>
      </div>

      {/* Schools Grid */}
      {loading ? (
        <div className={styles.schoolsGrid}>
          {[...Array(6)].map((_, i) => <SchoolCardSkeleton key={i} />)}
        </div>
      ) : (
        <>
          <div className={styles.schoolsGrid}>
            {currentSchools.map((school) => (
              <div key={school.id} className={styles.schoolCard}>
                <div className={styles.imageContainer}>
                  <Image
                    src={school.image}
                    alt={school.name}
                    width={500}         
                    height={300}     
                    className={styles.schoolImage}
                    onError={(e) => {                    }}
                    unoptimized={false}  
                  />
                  <div className={styles.overlay}>
                    <button className={styles.viewButton}>View Details</button>
                  </div>
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.schoolName}>{school.name}</h3>
                  <p className={styles.schoolAddress}>{school.address}</p>
                  <p className={styles.schoolCity}>{school.city}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className={styles.paginationButton}
              >
                ← Previous
              </button>
              
              <span className={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </span>
              
              <button 
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className={styles.paginationButton}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
