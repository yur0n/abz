import { Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious } from "@/components/ui/pagination";

export default function PaginationComponent({ page, handlePagination }: 
  { page: number; handlePagination: (goTo: number) => void }) {

	return (
    <main>
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={(e) => {
						e.preventDefault()
						handlePagination(0)
					} } />
        </PaginationItem>
        <PaginationItem>
          {page}
        </PaginationItem>
				<PaginationEllipsis />
        <PaginationItem>
          <PaginationNext onClick={(e) => {
						e.preventDefault()
						handlePagination(1)
					}} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
    </main>
  );
}
