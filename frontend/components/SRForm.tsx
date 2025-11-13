"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { depth, combineDepth } from "@/lib/depth"
import { COMPANIES, SYSTEMS, ASSIGNEES, REQUEST_TYPES } from "@/lib/constants"
import { saveDraft, loadDraft, clearDraft } from "@/lib/storage"
import { calculateProgress } from "@/lib/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dropzone } from "./Dropzone"
import { StickyBar } from "./StickyBar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const formSchema = z.object({
  company: z.string().min(1, "소속회사를 선택해주세요"),
  department: z.string().min(1, "부서/팀을 입력해주세요"),
  requester: z.string().min(1, "요청자 이름을 입력해주세요"),
  title: z.string().min(1, "제목을 입력해주세요"),
  system_name: z.string().min(1, "시스템을 선택해주세요"),
  assignee: z.string().min(1, "담당자를 선택해주세요"),
  category: z.string().min(1, "요청 구분을 선택해주세요"),
  request_date: z.date({
    error: () => ({ message: "요청일자를 선택해주세요" }),
  }),
  due_date: z.date().optional(),
  description: z.string().min(10, "상세 내용을 최소 10자 이상 입력해주세요"),
  attachment_url: z.string().min(1, "파일을 최소 1개 이상 첨부해주세요"),
  reply_email: z.string().email("올바른 이메일 형식을 입력해주세요").optional().or(z.literal("")),
})

type FormData = z.infer<typeof formSchema>

export function SRForm() {
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [ticketId, setTicketId] = useState("")
  const [progress, setProgress] = useState(0)
  const [systemOpen, setSystemOpen] = useState(false)
  const [assigneeOpen, setAssigneeOpen] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: "",
      department: "",
      requester: "",
      title: "",
      system_name: "",
      assignee: "",
      category: "",
      description: "",
      reply_email: "",
    },
  })

  const watchedFields = watch()

  useEffect(() => {
    const subscription = watch((value) => {
      saveDraft(value as any)
      setProgress(calculateProgress({ ...value, attachment_url: files.length > 0 ? "has-file" : "" }))
    })
    return () => subscription.unsubscribe()
  }, [watch, files])

  useEffect(() => {
    const draft = loadDraft()
    if (draft) {
      Object.entries(draft).forEach(([key, value]) => {
        if (key !== "savedAt" && value) {
          if (key === "request_date" || key === "due_date") {
            setValue(key as any, new Date(value as string))
          } else {
            setValue(key as any, value)
          }
        }
      })
    }
  }, [setValue])

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles)
    if (newFiles.length > 0) {
      // TODO: Replace with actual upload API call
      const mockUrl = URL.createObjectURL(newFiles[0])
      setValue("attachment_url", mockUrl, { shouldValidate: true })
    } else {
      setValue("attachment_url", "", { shouldValidate: true })
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)

    try {
      const payload = {
        ...data,
        request_date: format(data.request_date, "yyyy-MM-dd"),
        due_date: data.due_date ? format(data.due_date, "yyyy-MM-dd") : undefined,
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

      if (apiBaseUrl) {
        // TODO: Actual API call
        const response = await fetch(`${apiBaseUrl}/api/sr`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (!response.ok) throw new Error("제출 실패")

        const result = await response.json()
        setTicketId(result.ticketId || "SR-UNKNOWN")
      } else {
        // Mock success
        await new Promise((resolve) => setTimeout(resolve, 2000))
        setTicketId(`SR-${Date.now().toString().slice(-7)}`)
      }

      clearDraft()
      setShowSuccessModal(true)
      reset()
      setFiles([])
      setProgress(0)
    } catch (error) {
      console.error("Submit error:", error)
      alert("제출 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    if (confirm("모든 입력 내용을 초기화하시겠습니까?")) {
      reset()
      setFiles([])
      clearDraft()
      setProgress(0)
    }
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">작성 진행률</span>
          <span className="text-sm font-bold text-brand-600">{progress}%</span>
        </div>
        <div className="h-2.5 bg-white/70 rounded-full overflow-hidden backdrop-blur-sm shadow-inner-soft border border-white/40">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500 ease-out shadow-[0_0_12px_rgba(230,0,18,0.4)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <section>
          <div className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-white/80 to-white/60 border border-white/60 backdrop-blur-md shadow-depth-1 mb-6">
            <h3 className="text-lg font-bold text-gray-800">기본 정보</h3>
          </div>

          <div className="space-y-5">
            {/* Company - Radio Pills */}
            <div>
              <Label htmlFor="company" className="text-sm font-semibold text-gray-700 mb-3 block">
                소속회사 <span className="text-brand-600">*</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {COMPANIES.map((company) => (
                  <label key={company} className="cursor-pointer">
                    <input type="radio" value={company} {...register("company")} className="sr-only peer" />
                    <div
                      className={cn(
                        depth.pill,
                        depth.press,
                        "px-5 py-2.5 text-sm font-medium transition-all",
                        "peer-checked:bg-gradient-to-b peer-checked:from-brand-500 peer-checked:to-brand-600 peer-checked:text-white peer-checked:shadow-depth-2 peer-checked:border-transparent",
                        "peer-focus-visible:ring-2 peer-focus-visible:ring-brand-600/70 peer-focus-visible:ring-offset-2",
                      )}
                    >
                      {company}
                    </div>
                  </label>
                ))}
              </div>
              {errors.company && <p className="mt-2 text-sm text-brand-700 font-medium">{errors.company.message}</p>}
            </div>

            {/* Department */}
            <div>
              <Label htmlFor="department" className="text-sm font-semibold text-gray-700 mb-2 block">
                소속 부서/팀 <span className="text-brand-600">*</span>
              </Label>
              <Input
                id="department"
                placeholder="예: IT개발팀"
                {...register("department")}
                className={combineDepth(
                  depth.field,
                  depth.fieldHover,
                  depth.fieldFocus,
                  depth.fieldActive,
                  "px-4 py-3",
                )}
              />
              {errors.department && (
                <p className="mt-2 text-sm text-brand-700 font-medium">{errors.department.message}</p>
              )}
            </div>

            {/* Requester */}
            <div>
              <Label htmlFor="requester" className="text-sm font-semibold text-gray-700 mb-2 block">
                요청자 이름 <span className="text-brand-600">*</span>
              </Label>
              <Input
                id="requester"
                placeholder="예: 홍길동"
                {...register("requester")}
                className={combineDepth(
                  depth.field,
                  depth.fieldHover,
                  depth.fieldFocus,
                  depth.fieldActive,
                  "px-4 py-3",
                )}
              />
              {errors.requester && (
                <p className="mt-2 text-sm text-brand-700 font-medium">{errors.requester.message}</p>
              )}
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-sm font-semibold text-gray-700 mb-2 block">
                제목 <span className="text-brand-600">*</span>
              </Label>
              <Input
                id="title"
                placeholder="요청 사항을 간단히 요약해주세요"
                {...register("title")}
                className={combineDepth(
                  depth.field,
                  depth.fieldHover,
                  depth.fieldFocus,
                  depth.fieldActive,
                  "px-4 py-3",
                )}
              />
              {errors.title && <p className="mt-2 text-sm text-brand-700 font-medium">{errors.title.message}</p>}
            </div>
          </div>
        </section>

        <section>
          <div className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-white/70 to-white/50 border border-white/60 shadow-depth-1 mb-6">
            <h3 className="text-lg font-bold text-gray-800">시스템 정보</h3>
          </div>

          <div className="space-y-5">
            {/* System - Combobox */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                시스템 선택 <span className="text-brand-600">*</span>
              </Label>
              <Popover open={systemOpen} onOpenChange={setSystemOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={systemOpen}
                    className={cn(
                      combineDepth(depth.field, depth.fieldHover, depth.fieldFocus, depth.fieldActive),
                      "w-full justify-between px-4 py-3 h-auto font-normal",
                    )}
                  >
                    {watchedFields.system_name || "시스템을 선택하세요"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-white/95 backdrop-blur-md border-white/60" align="start">
                  <Command>
                    <CommandInput placeholder="시스템 검색..." />
                    <CommandList>
                      <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                      <CommandGroup>
                        {SYSTEMS.map((system) => (
                          <CommandItem
                            key={system}
                            value={system}
                            onSelect={() => {
                              setValue("system_name", system, { shouldValidate: true })
                              setSystemOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                watchedFields.system_name === system ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {system}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.system_name && (
                <p className="mt-2 text-sm text-brand-700 font-medium">{errors.system_name.message}</p>
              )}
            </div>

            {/* Assignee - Combobox */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                시스템 담당자 <span className="text-brand-600">*</span>
              </Label>
              <Popover open={assigneeOpen} onOpenChange={setAssigneeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={assigneeOpen}
                    className={cn(
                      combineDepth(depth.field, depth.fieldHover, depth.fieldFocus, depth.fieldActive),
                      "w-full justify-between px-4 py-3 h-auto font-normal",
                    )}
                  >
                    {watchedFields.assignee || "담당자를 선택하세요"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-white/95 backdrop-blur-md border-white/60" align="start">
                  <Command>
                    <CommandInput placeholder="담당자 검색..." />
                    <CommandList>
                      <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                      <CommandGroup>
                        {ASSIGNEES.map((assignee) => (
                          <CommandItem
                            key={assignee.email}
                            value={`${assignee.name} (${assignee.system})`}
                            onSelect={() => {
                              setValue("assignee", assignee.name, { shouldValidate: true })
                              setAssigneeOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                watchedFields.assignee === assignee.name ? "opacity-100" : "opacity-0",
                              )}
                            />
                            <div className="flex flex-col text-left">
                              <span className="font-medium text-gray-800">{assignee.name}</span>
                              <span className="text-xs text-gray-500">
                                {assignee.system} · {assignee.email}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.assignee && <p className="mt-2 text-sm text-brand-700 font-medium">{errors.assignee.message}</p>}
            </div>

            {/* Category - Radio Pills */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                요청 구분 <span className="text-brand-600">*</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {REQUEST_TYPES.map((type) => (
                  <label key={type} className="cursor-pointer">
                    <input type="radio" value={type} {...register("category")} className="sr-only peer" />
                    <div
                      className={cn(
                        depth.pill,
                        depth.press,
                        "px-5 py-2.5 text-sm font-medium transition-all",
                        "peer-checked:bg-gradient-to-b peer-checked:from-brand-500 peer-checked:to-brand-600 peer-checked:text-white peer-checked:shadow-depth-2 peer-checked:border-transparent",
                        "peer-focus-visible:ring-2 peer-focus-visible:ring-brand-600/70 peer-focus-visible:ring-offset-2",
                      )}
                    >
                      {type}
                    </div>
                  </label>
                ))}
              </div>
              {errors.category && <p className="mt-2 text-sm text-brand-700 font-medium">{errors.category.message}</p>}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  요청일자 <span className="text-brand-600">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        combineDepth(depth.field, depth.fieldHover, depth.fieldFocus, depth.fieldActive),
                        "w-full justify-start px-4 py-3 h-auto font-normal",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watchedFields.request_date ? (
                        format(watchedFields.request_date, "PPP", { locale: ko })
                      ) : (
                        <span className="text-muted-foreground">날짜 선택</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-md border-white/60" align="start">
                    <Calendar
                      mode="single"
                      selected={watchedFields.request_date}
                      onSelect={(date) => setValue("request_date", date as Date, { shouldValidate: true })}
                      initialFocus
                      locale={ko}
                    />
                  </PopoverContent>
                </Popover>
                {errors.request_date && (
                  <p className="mt-2 text-sm text-brand-700 font-medium">{errors.request_date.message}</p>
                )}
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">완료 희망일자 (선택)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        combineDepth(depth.field, depth.fieldHover, depth.fieldFocus, depth.fieldActive),
                        "w-full justify-start px-4 py-3 h-auto font-normal",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watchedFields.due_date ? (
                        format(watchedFields.due_date, "PPP", { locale: ko })
                      ) : (
                        <span className="text-muted-foreground">날짜 선택</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-md border-white/60" align="start">
                    <Calendar
                      mode="single"
                      selected={watchedFields.due_date}
                      onSelect={(date) => setValue("due_date", date)}
                      initialFocus
                      locale={ko}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-white/70 to-white/50 border border-white/60 shadow-depth-1 mb-6">
            <h3 className="text-lg font-bold text-gray-800">요청 상세</h3>
          </div>

          <div className="space-y-5">
            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700 mb-2 block">
                상세 내용 <span className="text-brand-600">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="증상, 재현 절차, 기대 결과 등을 자세히 작성해주세요 (최소 10자)"
                rows={6}
                {...register("description")}
                className={combineDepth(
                  depth.field,
                  depth.fieldHover,
                  depth.fieldFocus,
                  depth.fieldActive,
                  "px-4 py-3 resize-none",
                )}
              />
              {errors.description && (
                <p className="mt-2 text-sm text-brand-700 font-medium">{errors.description.message}</p>
              )}
            </div>

            {/* File Upload */}
            <div>
              <Dropzone files={files} onFilesChange={handleFilesChange} error={errors.attachment_url?.message} />
            </div>

            {/* Reply Email */}
            <div>
              <Label htmlFor="reply_email" className="text-sm font-semibold text-gray-700 mb-2 block">
                답변 받을 이메일 (선택)
              </Label>
              <Input
                id="reply_email"
                type="email"
                placeholder="example@daiso.com"
                {...register("reply_email")}
                className={combineDepth(
                  depth.field,
                  depth.fieldHover,
                  depth.fieldFocus,
                  depth.fieldActive,
                  "px-4 py-3",
                )}
              />
              {errors.reply_email && (
                <p className="mt-2 text-sm text-brand-700 font-medium">{errors.reply_email.message}</p>
              )}
            </div>
          </div>
        </section>

        {/* Hidden submit for sticky bar */}
        <button type="submit" className="sr-only" aria-hidden="true">
          제출
        </button>
      </form>

      <StickyBar isDirty={isDirty} onReset={handleReset} onSave={handleSubmit(onSubmit)} isSubmitting={isSubmitting} />

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-md border-white/60">
          <DialogHeader>
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-depth-2">
              <Check className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-center text-2xl">접수 완료</DialogTitle>
            <DialogDescription className="text-center space-y-4 pt-4">
              <p className="text-base text-gray-700">요청이 성공적으로 접수되었습니다.</p>
              <div className="p-4 rounded-xl bg-brand-50 border border-brand-100">
                <p className="text-sm text-gray-600 mb-1">티켓 번호</p>
                <p className="text-xl font-bold text-brand-600">{ticketId}</p>
              </div>
              <p className="text-sm text-gray-600">담당자가 확인 후 연락드리겠습니다.</p>
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => setShowSuccessModal(false)}
            className="w-full bg-gradient-to-b from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white shadow-depth-2"
          >
            확인
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
