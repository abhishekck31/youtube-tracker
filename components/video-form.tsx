"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Plus, Youtube, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useEducators } from "@/hooks/use-educators"
import { apiClient, YouTubeAPIError } from "@/lib/api"
import { videoFormSchema, type VideoFormData, type VideoEntry } from "@/lib/validations"

interface VideoFormProps {
  onVideoAdded: (video: VideoEntry) => void
}

export function VideoForm({ onVideoAdded }: VideoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { educators, isLoading: educatorsLoading, error: educatorsError } = useEducators()

  const form = useForm<VideoFormData>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      educatorId: "",
      youtubeLink: "",
    },
  })

  const selectedEducatorId = form.watch("educatorId")
  const selectedEducator = educators.find((e) => e.id === selectedEducatorId)

  const onSubmit = async (data: VideoFormData) => {
    setIsSubmitting(true)

    try {
      // Fetch video details from YouTube API
      const videoDetails = await apiClient.getVideoDetails(data.youtubeLink)

      const educator = educators.find((e) => e.id === data.educatorId)
      if (!educator) {
        throw new Error("Selected educator not found")
      }

      const newVideo: Omit<VideoEntry, "id"> = {
        educator: educator.name,
        educatorId: data.educatorId,
        videoTitle: videoDetails.title,
        duration: videoDetails.duration,
        date: new Date().toISOString(),
        youtubeLink: data.youtubeLink,
        status: "active",
        thumbnailUrl: videoDetails.thumbnailUrl,
        viewCount: videoDetails.viewCount,
        tags: [],
      }

      // Create video entry
      const createdVideo = await apiClient.createVideo(newVideo)

      onVideoAdded(createdVideo)
      form.reset()

      toast({
        title: "Video Added Successfully!",
        description: `"${videoDetails.title}" has been added to ${educator.name}'s record.`,
      })
    } catch (error) {
      console.error("Error adding video:", error)

      let errorMessage = "Failed to add video. Please try again."

      if (error instanceof YouTubeAPIError) {
        errorMessage = error.message
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (educatorsError) {
    return (
      <Card className="rounded-2xl border-0 shadow-xl bg-red-50 dark:bg-red-950/20">
        <CardContent className="flex items-center gap-3 p-6">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <p className="text-red-700 dark:text-red-300">Failed to load educators. Please refresh the page.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
            <Youtube className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Add New Video
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Track educational content and automatically fetch video details
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="educatorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Educator</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={educatorsLoading || isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors bg-white dark:bg-slate-800">
                          <SelectValue placeholder={educatorsLoading ? "Loading educators..." : "Select an educator"}>
                            {selectedEducator && (
                              <div className="flex items-center gap-3">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={selectedEducator.avatar || "/placeholder.svg"} />
                                  <AvatarFallback className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                    {selectedEducator.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="text-left">
                                  <p className="font-medium">{selectedEducator.name}</p>
                                  {selectedEducator.department && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      {selectedEducator.department}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        {educatorsLoading ? (
                          <div className="flex items-center justify-center p-4">
                            <LoadingSpinner size="sm" />
                          </div>
                        ) : (
                          educators
                            .filter((educator) => educator.isActive)
                            .map((educator) => (
                              <SelectItem key={educator.id} value={educator.id} className="rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={educator.avatar || "/placeholder.svg"} />
                                    <AvatarFallback className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                      {educator.initials}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{educator.name}</p>
                                    {educator.department && (
                                      <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {educator.department}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="youtubeLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      YouTube Video Link
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="url"
                        placeholder="https://youtube.com/watch?v=..."
                        disabled={isSubmitting}
                        className="h-12 rounded-xl border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors bg-white dark:bg-slate-800"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || educatorsLoading}
              className="w-full lg:w-auto h-12 px-8 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2 text-white" />
                  Processing Video...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Video
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
