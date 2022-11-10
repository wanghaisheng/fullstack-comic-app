import CardBookmark from '@/components/Card/CardBookmark'
import Banner from '@/components/common/Banner'
import Container from '@/components/common/Container'
import CustomLink from '@/components/common/Link'
import Pagination from '@/components/common/Pagination'
import { PageSEO } from '@/components/SEO'
import PictureGroupSkeleton from '@/components/Skeleton/PictureGroupSkeleton'
import constant from '@/data/constants'
import { categoriesDetailMetaData } from '@/data/siteMetadata'
import usePaginatedQuery2 from '@/hooks/usePaginatedQuery2'
import { publicRoutes } from '@/lib/utils/getRoutes'
import { getCategories } from '@/services/categoryServices.js'
import { getComicsByCategory, getComicsByCategory2 } from '@/services/comicService'
import { useRouter } from 'next/router'
import ScrollContainer from 'react-indiana-drag-scroll'
const { motion } = require('framer-motion')

export async function getStaticProps({ params }) {
  try {
    const { categoryName: activeCategory } = params
    const options = { category: activeCategory }
    const staticComics = await getComicsByCategory({ params: options })
    const staticCategories = await getCategories()

    return {
      props: { staticComics, staticCategories, activeCategory },
      revalidate: parseInt(process.env.NEXT_PUBLIC_REVALIDATE_IN_1_HOUR),
    }
  } catch (error) {
    return {
      notFound: true,
    }
  }
}

export async function getStaticPaths() {
  if (process.env.NODE_ENV === 'development') {
    return {
      paths: [],
      fallback: 'blocking',
    }
  }

  let categories = await getCategories()
  categories = [{ id: null, name: 'All' }, ...categories]

  const paths = categories.map((category) => {
    const { name: categoryName } = category
    return {
      params: { categoryName },
    }
  })
  return {
    paths,
    fallback: 'blocking', // fallback to server-side-rendering if a page not rendered yet
  }
}

export default function CategoryDetailPage({ staticComics, staticCategories, activeCategory }) {
  return (
    <>
      <PageSEO
        title={categoriesDetailMetaData.title(activeCategory)}
        description={categoriesDetailMetaData.description}
      />
      <FilterNav categories={staticCategories} activeCategory={activeCategory} />
      <Container className="transform duration-500">
        <div className="relative px-4 pt-8 pb-20 sm:px-6 lg:px-8 lg:pt-8 lg:pb-28">
          <div className="absolute inset-0">
            <div className="h-1/3 sm:h-2/3" />
          </div>
          <div className="relative mx-auto max-w-7xl">
            <BookmarkList
              initialComics={staticComics.results}
              totalRecords={staticComics.count}
              activeCategory={activeCategory}
              className="mx-auto mt-12 grid  grid-cols-responsive-card gap-5 lg:max-w-none"
            />
          </div>
        </div>
      </Container>
    </>
  )
}
function BookmarkList({ initialComics, totalRecords, activeCategory, className, limit }) {
  const {
    data: comics,
    currentPage,
    setCurrentPage,
    isLoading,
  } = usePaginatedQuery2(getComicsByCategory2, { category: activeCategory }, initialComics)

  const pageSize = constant.COMIC_LIMIT

  const filterByCategory = (comics) => {
    if (activeCategory?.toLowerCase() === 'all') return comics
    return comics?.filter((comic) => {
      // some: tests whether at least one element in the array passes
      return comic?.categories.some(
        (category) => category.name.toLowerCase() === activeCategory.toLowerCase()
      )
    })
  }

  const filtered = filterByCategory(comics)

  return (
    <div>
      {isLoading ? (
        <div className={className}>
          {Array(10)
            .fill()
            .map((index) => {
              return (
                <article
                  key={index}
                  className="group relative max-w-[311px] transform duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <PictureGroupSkeleton height={211} hasIcon={false} />
                </article>
              )
            })}
        </div>
      ) : filtered?.length > 0 ? (
        <motion.div layout className={className}>
          {filtered.slice(0, limit).map((item, index) => (
            <motion.div key={item.slug || item.id} layout>
              <CardBookmark index={index} {...item} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <Banner title="No results found" description="No results found" />
      )}
      <Pagination
        className="pagination-bar mt-4"
        currentPage={currentPage}
        totalCount={totalRecords}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
        isLoading={isLoading}
      />
    </div>
  )
}

function FilterNav({ categories, activeCategory }) {
  const allCategory = { id: null, name: 'All' }
  const router = useRouter()

  if (categories) categories = [allCategory, ...categories]

  const handleRedirect = (event) => {
    event.preventDefault()
    router.push(event.target.value)
  }

  return (
    <nav className="mx-4 flex min-h-[64px] lg:mx-0 lg:space-x-8 lg:px-8" aria-label="Global">
      <div className="mx-auto mt-8 w-full sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          onChange={(event) => handleRedirect(event)}
        >
          {categories?.map((category) => (
            <option key={category.id} value={publicRoutes.categories.getDynamicPath(category.name)}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <ScrollContainer className="scroll-container cursor-pointer">
            <nav className="-mb-px flex max-w-[90vw] space-x-8" aria-label="Tabs">
              {categories?.map((category) => (
                <CustomLink
                  key={category.name}
                  href={publicRoutes.categories.getDynamicPath(category.name)}
                  className="relative whitespace-nowrap py-4 text-sm font-medium"
                  aria-current={
                    activeCategory.toLowerCase() === category.name.toLowerCase()
                      ? 'page'
                      : undefined
                  }
                >
                  {category.name}
                  {activeCategory.toLowerCase() === category.name.toLowerCase() && (
                    <motion.div
                      className="absolute bottom-[0.5px] w-full whitespace-nowrap border-b-2 border-indigo-500 text-sm font-medium text-indigo-600"
                      layoutId="underline"
                    />
                  )}
                </CustomLink>
              ))}
            </nav>
          </ScrollContainer>
        </div>
      </div>
    </nav>
  )
}
