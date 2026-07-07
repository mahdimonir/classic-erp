import { Query } from "mongoose"

export class QueryBuilder<T, SchemaType> {
  public modelQuery: Query<T[], SchemaType>
  public query: Record<string, any>

  constructor(modelQuery: Query<T[], SchemaType>, query: Record<string, any>) {
    this.modelQuery = modelQuery
    this.query = query
  }

  
  search(searchableFields: string[]) {
    const search = this.query?.search
    if (search) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          (field) =>
            ({
              [field]: { $regex: search, $options: "i" },
            } as any)
        ),
      }) as any
    }
    return this
  }

  
  filter() {
    const queryObj = { ...this.query }
    const excludeFields = ["search", "sort", "page", "limit", "fields"]
    
    excludeFields.forEach((el) => delete queryObj[el])

    
    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|eq|ne|regex)\b/g, (match) => `$${match}`)
    
    
    const parsedQuery = JSON.parse(queryStr)
    
    
    Object.keys(parsedQuery).forEach((key) => {
      if (typeof parsedQuery[key] === "object") {
        Object.keys(parsedQuery[key]).forEach((subKey) => {
          const val = parsedQuery[key][subKey]
          if (!isNaN(Number(val)) && typeof val === "string" && val.trim() !== "") {
            parsedQuery[key][subKey] = Number(val)
          }
        })
      }
    })

    this.modelQuery = this.modelQuery.find(parsedQuery) as any
    return this
  }

  
  sort() {
    const sort = (this.query?.sort as string)?.split(",")?.join(" ") || "-createdAt"
    this.modelQuery = this.modelQuery.sort(sort)
    return this
  }

  
  paginate() {
    const page = Math.max(Number(this.query?.page) || 1, 1)
    const limit = Math.max(Number(this.query?.limit) || 10, 1)
    const skip = (page - 1) * limit

    this.modelQuery = this.modelQuery.skip(skip).limit(limit)
    return this
  }

  
  fields() {
    const fields = (this.query?.fields as string)?.split(",")?.join(" ") || "-__v"
    this.modelQuery = this.modelQuery.select(fields)
    return this
  }

  
  lean() {
    this.modelQuery = this.modelQuery.lean() as any
    return this
  }

  
  async countTotal() {
    const totalQueries = this.modelQuery.getFilter()
    const total = await this.modelQuery.model.countDocuments(totalQueries)
    const page = Math.max(Number(this.query?.page) || 1, 1)
    const limit = Math.max(Number(this.query?.limit) || 10, 1)
    const totalPage = Math.ceil(total / limit)

    return {
      page,
      limit,
      total,
      totalPage,
    }
  }
}
