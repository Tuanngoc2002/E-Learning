import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
	page: number
	pageSize: number
	total: number
	onPageChange: (page: number) => void
}

export function Pagination({
	page,
	pageSize,
	total,
	onPageChange,
	className,
	...props
}: PaginationProps) {
	const totalPages = Math.ceil(total / pageSize)
	if (totalPages <= 1) return null

	const getPages = () => {
		const pages = []
		for (let i = 1; i <= totalPages; i++) {
			pages.push(i)
		}
		return pages
	}

	return (
		<nav
			role="navigation"
			aria-label="pagination navigation"
			className={cn("flex justify-center py-4", className)}
			{...props}
		>
			<ul className="inline-flex items-center -space-x-px">
				<li>
					<button
						className="px-3 h-10 min-w-10 font-semibold py-2 ml-0 leading-tight text-indigo-800 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700"
						onClick={() => onPageChange(page - 1)}
						disabled={page === 1}
					>
						<ChevronLeft className="w-4 h-4" />
					</button>
				</li>
				{getPages().map((p) => (
					<li key={p}>
						<button
							className={cn(
								"px-3 font-semibold h-10 min-w-10 py-2 leading-tight border border-gray-300",
								p === page
									? "bg-indigo-600 text-white"
									: "bg-white text-indigo-800 hover:bg-gray-100 hover:text-gray-700"
							)}
							onClick={() => onPageChange(p)}
							aria-current={p === page ? "page" : undefined}
						>
							{p}
						</button>
					</li>
				))}
				<li>
					<button
						className="px-3 h-10 min-w-10 font-semibold py-2 leading-tight text-indigo-800 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700"
						onClick={() => onPageChange(page + 1)}
						disabled={page === totalPages}
					>
						<ChevronRight className="w-4 h-4" />
					</button>
				</li>
			</ul>
		</nav>
	)
}
